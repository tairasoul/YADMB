import * as oceanic from "oceanic.js";
import fs from "node:fs";
import ResolverUtils from "./resolverUtils.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection } from "oceanic.js";
import QueueHandler from "./queueSystem.js";
import { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import * as builders from "@oceanicjs/builders";
import util from "node:util";
const __dirname = path.join(path.dirname(decodeURIComponent(fileURLToPath(import.meta.url))), "..");
import { debugLog } from "../bot.js";
import Cache from "./cache.js";
import ms from "ms";
import ProxyHandler from "./proxyCycle.js";
import ytdl from "@distube/ytdl-core";
export default class MusicClient extends Client {
    m_guilds;
    commands;
    autocomplete;
    addons = [];
    resolvers = {
        songResolvers: [],
        songDataResolvers: [],
        playlistResolvers: [],
        audioResourceResolvers: [],
        songThumbnailResolvers: [],
        playlistThumbnailResolvers: [],
        pagers: []
    };
    addonCommands = [];
    rawCommands;
    cache_database;
    proxyCycle;
    authenticatedAgent;
    constructor(options) {
        super(options);
        this.m_guilds = new Collection();
        this.commands = new Collection();
        this.autocomplete = new Collection();
        this.rawCommands = [];
        this.cache_database = new Cache(options.database_path, options.database_expiry_time);
        if (options.should_proxy)
            this.proxyCycle = new ProxyHandler(ms(options.proxy_cycle_interval), options.should_cycle_proxies);
        if (options.use_cookies) {
            const cookieFile = path.join(__dirname, "..", "cookies.json");
            const agent = ytdl.createAgent(JSON.parse(fs.readFileSync(cookieFile, 'utf8')));
            this.authenticatedAgent = agent;
        }
        const intervalMs = ms(options.database_cleanup_interval);
        setInterval(() => {
            this.cache_database.removeInvalidFromAllTables();
        }, intervalMs);
        this.setMaxListeners(0);
        this.on("guildCreate", () => {
            this.editStatus("online", [{ name: `music in ${(this.guilds.size).toString()} servers.`, type: oceanic.ActivityTypes.GAME }]);
        });
        this.on("guildDelete", () => {
            this.editStatus("online", [{ name: `music in ${(this.guilds.size).toString()} servers.`, type: oceanic.ActivityTypes.GAME }]);
        });
    }
    addAddon(addon) {
        this.addons.push(addon);
    }
    registerAddons() {
        for (const addon of this.addons) {
            console.log(`registering addon ${addon.name}`);
            const data = addon.data;
            if (data.resolvers != undefined) {
                const resolvers = data.resolvers;
                for (const audio of resolvers.audio ?? [])
                    this.resolvers.audioResourceResolvers.push(audio);
                for (const resolver of resolvers.provider ?? [])
                    this.resolvers.songResolvers.push(resolver);
                for (const songData of resolvers.songData ?? [])
                    this.resolvers.songDataResolvers.push(songData);
                for (const playlistData of resolvers.playlist ?? [])
                    this.resolvers.playlistResolvers.push(playlistData);
                for (const thumbnail of resolvers.thumbnail ?? []) {
                    this.resolvers.songThumbnailResolvers.push(thumbnail);
                    this.resolvers.playlistThumbnailResolvers.push(thumbnail);
                }
                for (const pager of resolvers.pager ?? [])
                    this.resolvers.pagers.push(pager);
            }
            if (data.commands != undefined) {
                for (const command of data.commands)
                    this.addonCommands.push(command);
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
        // .filter for safety
        for (const command of fs.readdirSync(`${__dirname}/commands`).filter((v) => v.endsWith(".js"))) {
            const cmd = await import(`file://${__dirname}/commands/${command}`).then(m => m.default);
            this.addCommand(cmd.name, cmd.description, cmd.options, cmd.callback);
        }
    }
    async loadAutocomplete() {
        // .filter for safety
        for (const autocom of fs.readdirSync(`${__dirname}/autocomplete`).filter((v) => v.endsWith(".js"))) {
            const autocomplete = await import(`file://${__dirname}/autocomplete/${autocom}`).then(m => m.default);
            this.addAutocomplete(autocomplete);
        }
    }
    addAutocomplete(autocomplete) {
        this.autocomplete.set(autocomplete.command, autocomplete.execute);
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
        const registered = [];
        for (const command of this.rawCommands) {
            console.log(`registering global command ${command.data.name}`);
            this.commands.set(command.data.name, command);
            registered.push(command.data);
            /*try {
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
            }*/
        }
        // @ts-ignore
        await this.application.bulkEditGlobalCommands(registered);
        this.editStatus("online", [{ name: `music in ${(this.guilds.size).toString()} servers.`, type: oceanic.ActivityTypes.GAME }]);
    }
    on(event, listener) {
        if (event == "m_interactionCreate") {
            super.on("interactionCreate", (interaction) => 
            // @ts-ignore
            listener(interaction, {
                resolvers: new ResolverUtils(this.resolvers),
                guild: this.m_guilds.get(interaction.guildID),
                client: this,
                cache: this.cache_database,
                proxyInfo: this.proxyCycle?.activeProxy,
                authenticatedAgent: this.authenticatedAgent
            }));
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
            listener(interaction, {
                resolvers: new ResolverUtils(this.resolvers),
                guild: this.m_guilds.get(interaction.guildID),
                client: this,
                cache: this.cache_database,
                proxyInfo: this.proxyCycle?.activeProxy,
                authenticatedAgent: this.authenticatedAgent
            }));
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
        this.m_guilds.set(guild.id, {
            queue: new QueueHandler(audioPlayer),
            connection: null,
            voiceChannel: null,
            audioPlayer: audioPlayer,
            id: guild.id,
            leaveTimer: null
        });
        const cg = this.m_guilds.get(guild.id);
        cg.audioPlayer.on('error', (error) => {
            console.log(`an error occured with the audio player, ${error}`);
        });
        cg.audioPlayer.on("stateChange", () => {
            debugLog("stateChange debug log, current state:");
            debugLog(cg.audioPlayer.state.status);
            if (cg.audioPlayer.state.status === "idle") {
                if (cg.queue.nextTrack() != null) {
                    debugLog("logging queue's next track & index");
                    debugLog(util.inspect(cg.queue.tracks, false, 3, true));
                    debugLog(cg.queue.internalCurrentIndex);
                    cg.queue.play(new ResolverUtils(this.resolvers), this.proxyCycle?.activeProxy, this.authenticatedAgent);
                }
                else {
                    cg.queue.currentInfo = null;
                }
            }
        });
    }
    removeGuild(guild) {
        this.m_guilds.delete(guild.id);
    }
}
