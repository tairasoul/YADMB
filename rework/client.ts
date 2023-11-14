import * as oceanic from "oceanic.js";
import fs from "node:fs"
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, ClientOptions } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import voice, { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import util from "node:util"
import { AddonInfo, AudioResolver, command, dataResolver, playlistResolver, resolver } from "./addonLoader.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`)) debug = true;

function debugLog(text: any) {
    if (debug) console.log(text)
}

export type track = {
    name: string;
    url: string;
}

export type loopType = "none" | "queue" | "song" | "playlist";

export type queuedTrack = {
    type: "playlist" | "song";
    tracks: track[];
    trackNumber: number;
    name: string;
}

export type Guild = {
    queue: QueueHandler;
    connection: voice.VoiceConnection | null;
    voiceChannel: oceanic.VoiceChannel | null;
    audioPlayer: voice.AudioPlayer;
    id: string;
    leaveTimer: NodeJS.Timeout | null;
}

export type ResolverInformation = {
    songResolvers: resolver[];
    songDataResolvers: dataResolver[];
    playlistResolvers: playlistResolver[];
    audioResourceResolvers: AudioResolver[];
}

export type Command = {
    data: builders.ApplicationCommandBuilder, 
    execute: ((interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => Promise<any>)
}

interface MusicEvents extends oceanic.ClientEvents {
    "m_interactionCreate": [interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient];
}

export default class MusicClient extends Client {
    public m_guilds: {
        [id: string]: Guild
    };
    public commands: Collection<string, Command>;
    public readonly addons: AddonInfo[] = [];
    private resolvers: ResolverInformation = {
        songResolvers: [],
        songDataResolvers: [],
        playlistResolvers: [],
        audioResourceResolvers: []
    }
    private addonCommands: command[] = [];
    private rawCommands: Command[];
    constructor(options: ClientOptions) {
        super(options);
        this.m_guilds = {};
        this.commands = new Collection();
        this.rawCommands = [];
        this.setMaxListeners(0);
        this.on("guildCreate", () => {
            this.editStatus("online", [{name: (this.guilds.size).toString() + ' servers', type: 3}]);
        })
        this.on("guildDelete", () => {
            this.editStatus("online", [{name: (this.guilds.size).toString() + ' servers', type: 3}]);
        })
    }

    addAddon(addon: AddonInfo) {
        this.addons.push(addon);
    }

    registerAddons() {
        for (const addon of this.addons) {
            console.log(`registering addon ${addon.name}`);
            if (addon.type == "songResolver") 
                for (const resolver of addon.resolvers) this.resolvers.songResolvers.push(resolver);
            else if (addon.type == "command") 
                for (const command of addon.commands) this.addonCommands.push(command);
            else if (addon.type == "songDataResolver")
                for (const songResolver of addon.dataResolvers) this.resolvers.songDataResolvers.push(songResolver);
            else if (addon.type == "playlistDataResolver")
                for (const playlistResolver of addon.playlistResolvers) this.resolvers.playlistResolvers.push(playlistResolver);
            else if (addon.type == "audioResourceResolver")
                for (const audioResolver of addon.resourceResolvers) this.resolvers.audioResourceResolvers.push(audioResolver);
        }
    }

    registerAddonCommands() {
        for (const command of this.addonCommands) {
            console.log(`registering addon command ${command.name}`);
            // @ts-ignore
            this.addCommand(command.name, command.description, command.options, command.callback);
        }
    }

    async loadCommands() {
        for (const command of fs.readdirSync(`${__dirname}/commands`)) {
            const cmd: {
                name: string;
                description: string;
                options: oceanic.ApplicationCommandOptions[];
                callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => any;
            } = await import(`file://${__dirname}/commands/${command}`).then(m => m.default);
            this.addCommand(cmd.name, cmd.description, cmd.options, cmd.callback);
        }
    }

    addCommand(name: string, description: string, options: oceanic.ApplicationCommandOptions[] = [], callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => any) {
        const command = new builders.ApplicationCommandBuilder(1, name);
        for (const option of options) command.addOption(option);
        command.setDescription(description);
        command.setDMPermission(false);
        const toPush: Command = {
            data: command,
            execute: callback
        }
        this.rawCommands.push(toPush);
    }

    async registerCommands() {
        // go through commands
        for (const command of this.rawCommands) {
            console.log(`creating global command ${command.data.name}`);
            this.commands.set(command.data.name, command);
            try {
                // @ts-ignore
                await this.application.createGlobalCommand(command.data);
            }
            catch {
                console.log(`uh oh! encountered an error trying to create global command ${command.data.name}!\nretrying in 5 seconds.`);
                await new Promise<void>((resolve) => setTimeout(resolve, 5000));
                // @ts-ignore
                await this.application.createGlobalCommand(command.data);
            }
            finally {
                console.log(`created global command ${command.data.name}`)
            }
        }
        this.editStatus("online", [{name: (this.guilds.size).toString() + ' servers', type: 3}]);
    }

    on<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this {
        if (event == "m_interactionCreate") {
            super.on("interactionCreate", (interaction) => 
                // @ts-ignore
                listener(interaction as oceanic.CommandInteraction, this.resolvers, this.m_guilds[interaction.guildID as string], this)
            )
        }
        else {
            // @ts-ignore
            super.on(event, listener);
        }
        return this;
    }

    off<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this {
        if (event == "m_interactionCreate") {
            super.off("interactionCreate", (interaction) => 
            // @ts-ignore
                listener(interaction as oceanic.CommandInteraction, this.resolvers, this.m_guilds[interaction.guildID as string], this)
            )
        }
        else {
            // @ts-ignore
            super.off(event, listener);
        }
        return this;
    }

    addGuild(guild: oceanic.Guild) {
        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })
        this.m_guilds[guild.id] = {
            queue: new QueueHandler(audioPlayer),
            connection: null,
            voiceChannel: null,
            audioPlayer: audioPlayer,
            id: guild.id,
            leaveTimer: null
        }

        const cg = this.m_guilds[guild.id]
        
        cg.audioPlayer.on('error', (error: voice.AudioPlayerError) => {
            console.log(`an error occured with the audio player, ${error}`);
        })
    
        cg.audioPlayer.on("stateChange", () => {
            if (cg.audioPlayer.state.status === "idle") {
                if (cg.queue.nextTrack() != null) {
                    debugLog(util.inspect(cg.queue.tracks, false, 3, true))
                    debugLog(cg.queue.internalCurrentIndex)
                    cg.queue.play(this.resolvers);
                }
                else {
                    cg.queue.currentInfo = null;
                }
            }
        })
    }

    removeGuild(guild: oceanic.Guild) {
        delete this.m_guilds[guild.id];
    }
}