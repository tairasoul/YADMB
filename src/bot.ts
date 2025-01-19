import fs from "node:fs"
import path from 'path';
import { fileURLToPath } from 'url';
import * as oceanic from 'oceanic.js';
import MusicClient, { Guild } from './classes/client.js';
import addonLoader from "./classes/addonLoader.js";
export const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
import * as voice from "@discordjs/voice";
import { managerDefs } from "./classes/package.manager.js";
let debug = false;
if (fs.existsSync(`${path.join(__dirname, "..")}/enableDebugging`)) debug = true;

export function debugLog(text: any) {
    if (debug) console.log(text)
}

let setup = false;

const { token, package_manager, cache_path, expiry_time, check_interval, proxy } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));

const defs: managerDefs = {
    install: package_manager.install.trim(),
    uninstall: package_manager.uninstall.trim()
}

const client = new MusicClient({
    auth: token,
    allowedMentions:{
        roles: true,
        repliedUser:true,
    },
    gateway: {
        intents:[
            "GUILDS",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT",
            "GUILD_PRESENCES",
            "GUILD_MEMBERS",
            "GUILD_VOICE_STATES"
        ],
        autoReconnect: true,
        connectionTimeout: 900000
    },
    database_path: cache_path ?? "./cache.db",
    database_expiry_time: expiry_time ?? "3d",
    database_cleanup_interval: check_interval ?? "1m",
    proxy_cycle_interval: proxy.cycleInterval ?? "1h",
    should_cycle_proxies: proxy.cycling ?? false,
    should_proxy: proxy.enableProxies ?? false
});

/*if (web_features) {
    startWebFunctions();
    client.addCommand(web.data.name, web.data.description as string, [], web.execute);
}*/

const loader = new addonLoader(client, defs);

client.on('voiceStateUpdate', (oldState: oceanic.Member, newState: oceanic.JSONVoiceState | null) => {
    const guild = client.m_guilds.get(oldState.guildID) as Guild;
    if (client.getVoiceConnection(oldState.guildID) === undefined && guild.connection) {
        const connection = guild.connection as voice.VoiceConnection;
        connection.disconnect();
        guild.connection = null;
        guild.voiceChannel = null;
    }
    else {
        if (guild.voiceChannel !== null && guild.connection) {
            const channel = guild.voiceChannel as oceanic.VoiceChannel;
            const connection = guild.connection as voice.VoiceConnection;
            debugLog("logging amount of members in voice channel")
            debugLog(channel.voiceMembers.size);
            if (channel.voiceMembers.size == 1) {
                guild.leaveTimer = setTimeout(() => {
                    connection.disconnect();
                    guild.connection = null;
                    guild.voiceChannel = null;
                }, 60 * 1000)
            }
            else {
                if (guild.leaveTimer != null) clearTimeout(guild.leaveTimer as NodeJS.Timeout);
            }
        }
    }
})

client.on('error', (error) => {
    if (error instanceof Error) {
        console.log(`uh oh! an error has occured within MusicClient! error message: ${error.message}\nerror name: ${error.name}\nerror stack: ${error.stack || "none"}\nerror cause: ${error.cause || "no cause found"}`)
    }
    else {
        console.log(`uh oh! an error has occured within MusicClient! error is ${error}`);
    }
})

client.on("ready", async () => {
    if (setup) return;
    await loader.readAddons();
    loader.loadAddons();
    await client.loadAutocomplete();
    await client.loadCommands();
    loader.registerAddons();
    client.registerAddonCommands();
    for (const guild of client.guilds.values()) {
        console.log(`adding guild ${guild.id}`);
        client.addGuild(guild);
    }
    console.log("registering commands");
    await client.registerCommands();
    console.log("setup done");
    setup = true;
})

client.on("guildCreate", (guild) => client.addGuild(guild))

client.on("guildDelete", (guild) => client.removeGuild(guild as oceanic.Guild))

client.on("m_interactionCreate", async (interaction, info) => {
    if (interaction.type == oceanic.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE) {
        const autocomplete = client.autocomplete.get(interaction.data.name);
        if (!autocomplete)
            return;
        const results = await autocomplete(interaction);
        await interaction.result(results);
        return;
    }
    if (interaction.type != oceanic.InteractionTypes.APPLICATION_COMMAND)
        return;
    const command = client.commands.get(interaction.data.name);
    if (!command) {
        return;
    }
    try {
        await command.execute(interaction, info);
    } catch (error) {
        if (error) console.error(error);
        
        if (!interaction.acknowledged) {
            await interaction.createMessage({content: `There was an error while executing this command, error is ${error}`});
        }
        else {
            await interaction.editOriginal({content: `There was an error while executing this command, error is ${error}`});
        }
    }
})

await client.connect();

export default client.addons;
