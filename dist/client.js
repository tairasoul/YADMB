import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import util from "node:util";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`))
    debug = true;
function debugLog(text) {
    if (debug)
        console.log(text);
}
export default class MusicClient extends Client {
    m_guilds;
    commands;
    addons = [];
    resolvers = {
        songResolvers: [],
        songDataResolvers: [],
        playlistResolvers: []
    };
    addonCommands = [];
    rawCommands;
    constructor(options) {
        super(options);
        this.m_guilds = {};
        this.commands = new Collection();
        this.rawCommands = [];
        this.setMaxListeners(0);
        this.on("guildCreate", () => {
            this.editStatus("online", [{ name: (this.guilds.size).toString() + ' servers', type: 3 }]);
        });
        this.on("guildDelete", () => {
            this.editStatus("online", [{ name: (this.guilds.size).toString() + ' servers', type: 3 }]);
        });
    }
    addAddon(addon) {
        this.addons.push(addon);
    }
    registerAddons() {
        for (const addon of this.addons) {
            console.log(`registering addon ${addon.name}`);
            if (addon.type == "songResolver")
                for (const resolver of addon.resolvers)
                    this.resolvers.songResolvers.push(resolver);
            else if (addon.type == "command")
                for (const command of addon.commands)
                    this.addonCommands.push(command);
            else if (addon.type == "songDataResolver")
                for (const songResolver of addon.dataResolvers)
                    this.resolvers.songDataResolvers.push(songResolver);
            else if (addon.type == "playlistDataResolver")
                for (const playlistResolver of addon.playlistResolvers)
                    this.resolvers.playlistResolvers.push(playlistResolver);
        }
    }
    registerAddonCommands() {
        for (const command of this.addonCommands) {
            console.log(`registering addon command ${command.name}`);
            // @ts-ignore
            this.addCommand(command.name, command.description, command.options, command.callback);
        }
    }
    addCommand(name, description, options, callback) {
        const command = new builders.ApplicationCommandBuilder(1, name);
        for (const option of options)
            command.addOption(option);
        command.setDescription(description);
        command.setDMPermission(false);
        const toPush = {
            data: command,
            execute: callback
        };
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
                await new Promise((resolve) => setTimeout(resolve, 5000));
                // @ts-ignore
                await this.application.createGlobalCommand(command.data);
            }
            finally {
                console.log(`created global command ${command.data.name}`);
            }
        }
        this.editStatus("online", [{ name: (this.guilds.size).toString() + ' servers', type: 3 }]);
    }
    on(event, listener) {
        if (event == "m_interactionCreate") {
            super.on("interactionCreate", (interaction) => 
            // @ts-ignore
            listener(interaction, this.resolvers, this.m_guilds[interaction.guildID], this));
        }
        else {
            // @ts-ignore
            super.on(event, listener);
        }
        return this;
    }
    off(event, listener) {
        if (event == "m_interactionCreate") {
            super.off("interactionCreate", (interaction) => 
            // @ts-ignore
            listener(interaction, this.resolvers, this.m_guilds[interaction.guildID], this));
        }
        else {
            // @ts-ignore
            super.off(event, listener);
        }
        return this;
    }
    addGuild(guild) {
        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        });
        this.m_guilds[guild.id] = {
            queue: new QueueHandler(audioPlayer),
            connection: null,
            voiceChannel: null,
            audioPlayer: audioPlayer,
            id: guild.id,
            leaveTimer: null
        };
        const cg = this.m_guilds[guild.id];
        cg.audioPlayer.on('error', (error) => {
            console.log(`an error occured with the audio player, ${error}`);
        });
        cg.audioPlayer.on("stateChange", () => {
            if (cg.audioPlayer.state.status === "idle") {
                if (cg.queue.nextTrack() != null) {
                    debugLog(util.inspect(cg.queue.tracks, false, 3, true));
                    debugLog(cg.queue.internalCurrentIndex);
                    cg.queue.play();
                }
                else {
                    cg.queue.currentInfo = null;
                }
            }
        });
    }
    removeGuild(guild) {
        delete this.m_guilds[guild.id];
    }
}
