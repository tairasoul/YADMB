import * as oceanic from "oceanic.js";
import fs from "node:fs"
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, ClientOptions } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import voice, { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import util from "node:util"
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

type loopType = "none" | "queue" | "song" | "playlist";

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

type Command = {
    data: builders.ApplicationCommandBuilder, 
    execute: ((interaction: oceanic.CommandInteraction, guild: Guild, client: MusicClient) => Promise<any>)
}

interface MusicEvents extends oceanic.ClientEvents {
    "m_interactionCreate": [interaction: oceanic.CommandInteraction, guild: Guild, client: MusicClient];
}

export default class MusicClient extends Client {
    private m_guilds: {
        [id: string]: Guild
    };
    private commands: Collection<string, Command>;
    private rawCommands: Command[];
    constructor(options: ClientOptions) {
        super(options);
        this.m_guilds = {};
        this.commands = new Collection();
        this.rawCommands = [];
        this.setMaxListeners(0);
    }

    addCommand(name: string, description: string, options: oceanic.ApplicationCommandOptions[], callback: (interaction: oceanic.CommandInteraction, guild: Guild, client: MusicClient) => any) {
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
            // @ts-ignore
            await client.application.createGlobalCommand(command.data);
            console.log(`created global command ${command.data.name}`);
        }
        this.editStatus("online", [{name: (this.guilds.size).toString() + ' servers', type: 3}]);
    }

    on<K extends keyof MusicEvents>(event: K, listener: (...args: MusicEvents[K]) => void): this {
        if (event == "m_interactionCreate") {
            super.on("interactionCreate", (interaction) => 
            // @ts-ignore
                listener(interaction as oceanic.CommandInteraction, this.m_guilds[interaction.guildID as string], this)
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
                listener(interaction as oceanic.CommandInteraction, this.m_guilds[interaction.guildID as string], this)
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
                    cg.queue.play();
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