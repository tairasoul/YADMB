import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import commands from "./commands/index.js";
import MusicClient from './client.js';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`))
    debug = true;
function debugLog(text) {
    if (debug)
        console.log(text);
}
const { token } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));
const client = new MusicClient({
    auth: token,
    allowedMentions: {
        roles: true,
        repliedUser: true,
    },
    gateway: {
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT",
            "GUILD_PRESENCES",
            "GUILD_MEMBERS",
            "GUILD_VOICE_STATES"
        ],
        autoReconnect: true,
        connectionTimeout: 900000
    }
});
client.on('voiceStateUpdate', (oldState, newState) => {
    const guild = client.m_guilds[oldState.guildID];
    if (client.getVoiceConnection(oldState.guildID) === undefined && guild.connection) {
        const connection = guild.connection;
        connection.disconnect();
        connection.destroy();
        guild.connection = null;
        guild.voiceChannel = null;
    }
    else {
        if (guild.voiceChannel !== null && guild.connection) {
            const channel = guild.voiceChannel;
            const connection = guild.connection;
            debugLog(channel.voiceMembers.size);
            if (channel.voiceMembers.size == 1) {
                guild.leaveTimer = setTimeout(() => {
                    connection.disconnect();
                    connection.destroy();
                    guild.connection = null;
                    guild.voiceChannel = null;
                }, 60 * 1000);
            }
            else {
                if (guild.leaveTimer != null)
                    clearTimeout(guild.leaveTimer);
            }
        }
    }
});
for (const command of commands) {
    debugLog(`calling client.addCommand("${command.name}", command.options, command.callback)`);
    // @ts-ignore
    client.addCommand(command.name, command.description, command.options != undefined ? command.options : [], command.callback);
}
client.on("ready", async () => {
    for (const guild of client.guilds.values()) {
        debugLog(`adding guild ${guild.id}`);
        client.addGuild(guild);
    }
    debugLog("registering commands");
    await client.registerCommands();
});
client.on("guildCreate", async (guild) => client.addGuild(guild));
client.on("guildDelete", (guild) => client.removeGuild(guild));
client.on("m_interactionCreate", async (interaction, guild, m_client) => {
    const command = client.commands.get(interaction.data.name);
    if (!command)
        return;
    try {
        await command.execute(interaction, guild, m_client);
    }
    catch (error) {
        if (error)
            console.error(error);
        if (!interaction.acknowledged) {
            await interaction.createFollowup({ content: `There was an error while executing this command, error is ${error}` });
        }
        else
            await interaction.editOriginal({ content: `There was an error while executing this command, error is ${error}` });
    }
});
await client.connect();
