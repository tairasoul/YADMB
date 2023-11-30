import fs from "node:fs";
import ResolverUtils from "./resolverUtils.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import util from "node:util";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
import { debugLog } from "./bot.js";
export default class MusicClient extends Client {
    m_guilds;
    commands;
    addons = [];
    resolvers = {
        songResolvers: [],
        songDataResolvers: [],
        playlistResolvers: [],
        audioResourceResolvers: [],
        songThumbnailResolvers: [],
        playlistThumbnailResolvers: []
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
            if (addon.type == "songResolver") {
                for (const resolver of addon.resolvers) {
                    this.resolvers.songResolvers.push(resolver);
                }
            }
            else if (addon.type == "command") {
                for (const command of addon.commands) {
                    this.addonCommands.push(command);
                }
            }
            else if (addon.type == "songDataResolver") {
                for (const songResolver of addon.dataResolvers) {
                    this.resolvers.songDataResolvers.push(songResolver);
                }
            }
            else if (addon.type == "playlistDataResolver") {
                for (const playlistResolver of addon.playlistResolvers) {
                    this.resolvers.playlistResolvers.push(playlistResolver);
                }
            }
            else if (addon.type == "audioResourceResolver") {
                for (const audioResolver of addon.resourceResolvers) {
                    this.resolvers.audioResourceResolvers.push(audioResolver);
                }
            }
            else if (addon.type == "songThumbnailResolver") {
                for (const thumbnailResolver of addon.thumbnailResolvers) {
                    this.resolvers.songThumbnailResolvers.push(thumbnailResolver);
                }
            }
            else if (addon.type == "playlistThumbnailResolver") {
                for (const thumbnailResolver of addon.thumbnailResolvers) {
                    this.resolvers.playlistThumbnailResolvers.push(thumbnailResolver);
                }
            }
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
            const cmd = await import(`file://${__dirname}/commands/${command}`).then(m => m.default);
            this.addCommand(cmd.name, cmd.description, cmd.options, cmd.callback);
        }
    }
    addCommand(name, description, options = [], callback) {
        const command = new builders.ApplicationCommandBuilder(1, name);
        for (const option of options) {
            command.addOption(option);
        }
        command.setDescription(description);
        command.setDMPermission(false);
        const toPush = {
            data: command,
            execute: callback
        };
        this.rawCommands.push(toPush);
    }
    async registerCommands() {
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
    async removeUnknownCommands() {
        for (const globalCommand of await this.application.getGlobalCommands()) {
            if (!this.rawCommands.find((cmd) => cmd.data.name == globalCommand.name)) {
                console.log(`command ${globalCommand.name} was not found in MusicClient.rawCommands, deleting.`);
                await globalCommand.delete();
                console.log(`deleted command ${globalCommand.name}`);
            }
        }
    }
    on(event, listener) {
        if (event == "m_interactionCreate") {
            super.on("interactionCreate", (interaction) => 
            // @ts-ignore
            listener(interaction, new ResolverUtils(this.resolvers), this.m_guilds[interaction.guildID], this));
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
            listener(interaction, new ResolverUtils(this.resolvers), this.m_guilds[interaction.guildID], this));
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
                    cg.queue.play(new ResolverUtils(this.resolvers));
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
