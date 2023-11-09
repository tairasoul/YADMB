import { Collection } from 'oceanic.js';
import fs from "node:fs"
import path from 'path';
import { fileURLToPath } from 'url';
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import utils, { PageData, PageHolder } from './utils.js';
import * as voice from "@discordjs/voice";
import { InfoData, default as playdl } from 'play-dl';
import humanize from 'humanize-duration'
import ytdl from 'ytdl-core';
import { createAudioPlayer, NoSubscriberBehavior, createAudioResource } from "@discordjs/voice";
import ytpl from 'ytpl';
// @ts-ignore
import {default as lzw} from "lzwcompress";
import base64 from "base-64";
import rstring from "randomstring";
import util from "node:util"
import QueueHandler from './queueSystem.js';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`)) debug = true;

playdl.getFreeClientID().then((val) => 
    playdl.setToken({
        soundcloud: {
            client_id: val
        }
    })
)

let setup = false;

function debugLog(text: any) {
    if (debug) console.log(text)
}

function embedMessage(text: string) {
    const embed = new builders.EmbedBuilder();
    embed.setDescription(text);
    return embed.toJSON()
}

// util functions

function startsWith(str: string, strings: string[]) {
    for (const string of strings) {
        if (str.startsWith(string)) return true;
    }
    return false
}

function getProvider(url: string) {
    // no clue if these are all, please open an issue if they are not
    const youtube = ["https://www.youtube.com", "https://youtu.be", "https://music.youtube.com"];
    const sc = ["https://soundcloud.com", "https://on.soundcloud.com"];
    const deezer = ["https://www.deezer.com"];
    const spotify = ["https://open.spotify.com"];
    if (startsWith(url, youtube)) return "youtube";
    if (startsWith(url, sc)) return "soundcloud";
    if (startsWith(url, deezer)) return "deezer";
    if (startsWith(url, spotify)) return "spotify";
}

function setupGuild(guild: oceanic.Guild) {
    const cg = guilds[guild.id]

    cg.audioPlayer.on('error', (error: voice.AudioPlayerError) => {
        console.log(`an error occured with the audio player, ${error}`);
    })

    cg.audioPlayer.on("stateChange", () => {
        if (cg.audioPlayer.state.status === "idle") {
            if (cg.queuedTracks[cg.currentTrack] != undefined) {
                debugLog(util.inspect(cg.queuedTracks, false, 3, true))
                debugLog(cg.currentTrack)
                switch (cg.loopType) {
                    case "none":
                        if (cg.queuedTracks[cg.currentTrack].type === "playlist") {
                            cg.queuedTracks[cg.currentTrack].tracks.splice(0, 1);
                            if (cg.queuedTracks[cg.currentTrack].tracks.length === 0) {
                                cg.queuedTracks.splice(0, 1);
                                if (cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber])  playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id)
                            }
                            else {
                                if (cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber])  playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id)
                            }
                        }
                        else {
                            cg.queuedTracks.splice(0, 1);
                            if (cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber])  playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id)
                        }
                        break;
                    case "song":
                        if (cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber])  playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                        break;
                    case "queue":
                        debugLog(cg.currentTrack)
                        if (cg.queuedTracks[cg.currentTrack].type === "playlist") {
                            cg.queuedTracks[cg.currentTrack].trackNumber += 1;
                        }
                        else {
                            cg.currentTrack += 1;
                        }
                        if (cg.currentTrack >= cg.queuedTracks.length) cg.currentTrack = 0;
                        if (cg.queuedTracks[cg.currentTrack].trackNumber >= cg.queuedTracks[cg.currentTrack].tracks.length) cg.currentTrack += 1
                        if (cg.currentTrack >= cg.queuedTracks.length) cg.currentTrack = 0;
                        debugLog(cg.currentTrack)
                        if (cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber])  playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id)
                        break;
                    case "playlist":
                        if (cg.queuedTracks[cg.currentTrack].tracks.length <= cg.queuedTracks[cg.currentTrack].trackNumber || cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber + 1] === undefined) {
                            cg.queuedTracks[cg.currentTrack].trackNumber = 0;
                        }
                        else {
                            cg.queuedTracks[cg.currentTrack].trackNumber += 1;
                        }
                        if (cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber])  playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id)
                        break;
                }
            }
            else {
                cg.currentResource = null;
                cg.songStart = null;
                cg.currentInfo = null;
            }
        }
    })
}

// interfaces

type track = {
    name: string;
    url: string;
}

type loopType = "none" | "queue" | "song" | "playlist";

type queuedTrack = {
    type: "playlist" | "song";
    tracks: track[];
    trackNumber: number;
    name: string;
}

type Guild = {
    queue: QueueHandler;
    connection: voice.VoiceConnection | null;
    voiceChannel: oceanic.VoiceChannel | null;
    audioPlayer: voice.AudioPlayer;
    leaveTimer: NodeJS.Timeout | null;
}

type Command = {
    data: builders.ApplicationCommandBuilder, 
    execute: (interaction: oceanic.CommandInteraction) => Promise<any> 
}

// starter variables

const { token } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));
const guilds: { [id: string]: Guild } = {}
const loopTypeStrs = {
    "none": "No longer looping anything.",
    "song": "Looping the currently playing song.",
    "playlist": "Looping the currently playing playlist (same as song if the current track was added as a song)",
    "queue": "Looping the entire queue."
}

// main client and listeners

const client = new oceanic.Client({
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
    }
})

client.on('voiceStateUpdate', (oldState: oceanic.Member, newState: oceanic.JSONVoiceState | null) => {
    if (client.getVoiceConnection(oldState.guildID) === undefined && guilds[oldState.guildID].connection) {
        const connection = guilds[oldState.guildID].connection as voice.VoiceConnection;
        connection.disconnect();
        guilds[oldState.guildID].connection = null;
        guilds[oldState.guildID].voiceChannel = null;
    }
    else {
        if (guilds[oldState.guildID].voiceChannel !== null && guilds[oldState.guildID].connection) {
            const channel = guilds[oldState.guildID].voiceChannel as oceanic.VoiceChannel;
            const connection = guilds[oldState.guildID].connection as voice.VoiceConnection;
            debugLog(channel.voiceMembers.size);
            if (channel.voiceMembers.size == 1) {
                guilds[oldState.guildID].leaveTimer = setTimeout(() => {
                    connection.disconnect();
                    connection.destroy();
                    guilds[oldState.guildID].connection = null;
                    guilds[oldState.guildID].voiceChannel = null;
                }, 60 * 1000)
            }
            else {
                if (guilds[oldState.guildID].leaveTimer != null) clearTimeout(guilds[oldState.guildID].leaveTimer as NodeJS.Timeout);
            }
        }
    }
})

client.on("ready", () => {
    console.log("logged in");
})

client.on('error', (error: string | Error) => {
    console.error(`something went wrong, ${error}`)
})

// start commands

const ccommands = new Collection<string, Command>();

client.on('guildCreate', (guild: oceanic.Guild) => {
    const audioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
        }
    })
    guilds[guild.id] = {
        queue: new QueueHandler(audioPlayer),
        connection: null,
        voiceChannel: null,
        audioPlayer: audioPlayer,
        leaveTimer: null
    }

    setupGuild(guild)

    client.editStatus("online", [{name: (client.guilds.size).toString() + ' servers', type: 3}]);
})

client.setMaxListeners(0);

client.on('guildDelete', (guild: oceanic.Uncached | oceanic.Guild) => {
    guilds[guild.id].audioPlayer.removeAllListeners();
    delete guilds[guild.id]
    client.editStatus("online", [{name: (client.guilds.size).toString() + ' servers', type: 3}]);
})

const commands: Command[] = [
    {
        data: new builders.ApplicationCommandBuilder(oceanic.ApplicationCommandTypes.CHAT_INPUT, "add-url")
        .setDescription("Add a link to the queue.")
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.STRING,
                name: "link",
                description: "Link to add.",
                required: true
            }
        )
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.BOOLEAN,
                name: "next",
                description: "Should this song play next? This will either add it in the current playlist, or in the queue.",
                required: false
            }
        ).setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const video = interaction.data.options.getString("link", true);
            const next = interaction.data.options.getBoolean("next");
            const provider = getProvider(video);
            if (provider === undefined) {
                const embed = new builders.EmbedBuilder();
                embed.setDescription(`Could not get video/music provider for the link you provided.
                Does it start with any of the following URLs?
                https://www.youtube.com
                https://youtu.be
                https://music.youtube.com
                https://soundcloud.com
                https://on.soundcloud.com
                https://www.deezer.com
                https://open.spotify.com`)
                return await interaction.editOriginal({embeds: [embed.toJSON()]});
            }
            if (interaction.guildID) {
                const queue = guilds[interaction.guildID].queue;
                const ct = queue.internalCurrentIndex;
                const nowPlaying = queue.tracks[ct];
                const qt = queue.tracks;
                switch(provider) {
                    case "youtube":
                        if (!ytdl.validateURL(video)) {
                            const embed = new builders.EmbedBuilder()
                            embed.setDescription("Invalid link.")
                            return await interaction.editOriginal({embeds: [embed.toJSON()]});
                        }
                        const info = await playdl.video_basic_info(video);
                        const title = info.video_details.title as string;
                        const youtubeadd: queuedTrack = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: title,
                                    url: video
                                }
                            ],
                            name: title
                        }
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push(
                                    {
                                        name: title,
                                        url: video
                                    }
                                )
                            }
                            else {
                                qt.splice(ct + 1, 0, youtubeadd)
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(youtubeadd);
                        }
                        const yembed = new builders.EmbedBuilder();
                        yembed.setDescription(`Added **${title}** to queue.`);
                        await interaction.editOriginal({embeds: [yembed.toJSON()]})
                        break;
                    // both deezer and spotify need to be searched up on youtube
                    case "deezer":
                        const dvid = await playdl.deezer(video);
                        if (dvid.type !== "track") {
                            const dembed = new builders.EmbedBuilder();
                            dembed.setDescription(`**${dvid.title}** is not a Deezer track! add-url only supports singular tracks.`);
                            return await interaction.editOriginal({embeds: [dembed.toJSON()]})
                        }
                        const yvid = (await playdl.search(dvid.title, {
                            limit: 1
                        }))[0]
                        const deezeradd: queuedTrack = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: dvid.title,
                                    url: yvid.url
                                }
                            ],
                            name: dvid.title
                        }
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push(
                                    {
                                        name: dvid.title,
                                        url: yvid.url
                                    }
                                )
                            }
                            else {
                                qt.splice(ct + 1, 0, deezeradd)
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(deezeradd);                        
                        }
                        const dembed = new builders.EmbedBuilder();
                        dembed.setDescription(`Added **${dvid.title}** to queue.`);
                        await interaction.editOriginal({embeds: [dembed.toJSON()]})
                        break;
                    case "spotify":
                        try {
                            if (playdl.is_expired()) {
                                await playdl.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                            }
                        } catch {}
                        const sp_data = await playdl.spotify(video);

                        if (sp_data.type !== "track") {
                            const dembed = new builders.EmbedBuilder();
                            dembed.setDescription(`**${sp_data.name}** is not a Spotify track! add-url only supports singular tracks.`);
                            return await interaction.editOriginal({embeds: [dembed.toJSON()]})
                        }

                        const search = (await playdl.search(sp_data.name, { limit: 1}))[0];
                        const spotifyadd: queuedTrack = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: sp_data.name,
                                    url: search.url
                                }
                            ],
                            name: sp_data.name
                        }
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push(
                                    {
                                        name: sp_data.name,
                                        url: search.url
                                    }
                                )
                            }
                            else {
                                qt.splice(ct + 1, 0, spotifyadd)
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(spotifyadd);
                        }
                        const spembed = new builders.EmbedBuilder();
                        spembed.setDescription(`Added **${sp_data.name}** to queue.`);
                        await interaction.editOriginal({embeds: [spembed.toJSON()]})
                        break;
                    case "soundcloud":
                        const sinfo = await playdl.soundcloud(video);
                        const sc_add: queuedTrack = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: sinfo.name,
                                    url: video
                                }
                            ],
                            name: sinfo.name
                        }
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push(
                                    {
                                        name: sinfo.name,
                                        url: video
                                    }
                                )
                            }
                            else {
                                qt.splice(ct + 1, 0, sc_add)
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(sc_add);
                        }
                        const scembed = new builders.EmbedBuilder();
                        scembed.setDescription(`Added **${sinfo.name}** to queue.`);
                        await interaction.editOriginal({embeds: [scembed.toJSON()]})
                        break;
                }
                const ctn = guilds[interaction.guildID].currentTrack;
                const t = guilds[interaction.guildID].queuedTracks[ctn];
                const cst = t.trackNumber;
                const st = t.tracks[cst];
                debugLog(ctn);
                debugLog(t);
                debugLog(cst);
                debugLog(st)
                if (guilds[interaction.guildID].audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection) playSong(st, interaction.guildID as string);
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "search")
        .setDescription("Add video(s) from the search results of a specific search term.")
        .addOption(
            {
                name: "term",
                description: "What to search for.",
                required: true,
                type: 3
            }
        )
        .addOption(
            {
                name: "exclude-playlist",
                description: "Exclude playlists?",
                required: false,
                type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
            }
        )
        .addOption(
            {
                name: "exclude-channel",
                description: "Exclude channels?",
                required: false,
                type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
            }
        )
        .addOption(
            {
                name: "exclude-video",
                description: "Exclude videos?",
                required: false,
                type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
            }
        )
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const term = interaction.data.options.getString('term', true);
            const excludes = [];
            const enames = [
                "exclude-playlist",
                "exclude-channel",
                "exclude-video"
            ] as const;
            for (const name of enames) {
                if (interaction.data.options.getBoolean(name) === true) {
                    excludes.push(name.split("-")[1])
                }
            }
            const results = await playdl.search(term);
            const searches: Array<{name: string}> = [];
            const names: { [key: string]: {embed: builders.EmbedBuilder, url: string, title: string}} = {};
            let currentVideo: { embed: any; title: any; url: any; };
            for (const item of results) {
                if (!excludes.includes(item.type)) {
                    const embed = new builders.EmbedBuilder();
                    embed.setImage(item.thumbnails[0].url);
                    embed.setTitle(item.title as string);
                    if (item.uploadedAt) embed.addField('Uploaded', item.uploadedAt);
                    if (item.channel?.name) embed.addField("Author",  item.channel.name);
                    if (item.views) embed.addField("Views", item.views.toString());
                    if (item.durationInSec) embed.addField("Duration", humanize(item.durationInSec * 1000));
                    names[item.title as string] = {
                        embed: embed,
                        url: item.url,
                        title: item.title as string
                    }
                    // @ts-ignore
                    if (!currentVideo) currentVideo = {
                        embed: embed,
                        url: item.url,
                        title: item.title
                    };
                    searches.push({name: item.title as string});
                }
            }
            const accept = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}Add${term}`);
            accept.type = oceanic.ComponentTypes.BUTTON;
            accept.setLabel("Add video to queue");
            const acceptnext = new builders.Button(oceanic.ButtonStyles.PRIMARY, `${interaction.user.id}AddNext${term}`);
            acceptnext.setLabel("Play this video next");
            acceptnext.type = oceanic.ComponentTypes.BUTTON;
            const actionRow = utils.SelectMenu(searches, `${interaction.user.id}Search${term}`);
            const actionRow2 = new builders.ActionRow();
            actionRow2.type = oceanic.ComponentTypes.ACTION_ROW;
            actionRow2.addComponents(accept, acceptnext);
            // change page
            // @ts-ignore
            const pl = async (i) => {
                // @ts-ignore
                const values = (i.data.values as oceanic.SelectMenuValuesWrapper).getStrings();
                const embed = names[values[0]].embed;
                currentVideo = names[values[0]];
                try {
                    // @ts-ignore
                    await i.editParent({components: [actionRow, actionRow2], embeds: [embed.toJSON()]});
                }
                catch {}
            }
            // add video to queue
            // @ts-ignore
            const vl =  async i => {
                await i.defer();
                const youtubeadd: queuedTrack = {
                    type: "song",
                    trackNumber: 0,
                    tracks: [
                        {
                            name: currentVideo.title,
                            url: currentVideo.url
                        }
                    ],
                    name: currentVideo.title
                }
                guilds[interaction.guildID as string].queuedTracks.push(youtubeadd);
                const embed = new builders.EmbedBuilder();
                embed.setDescription(`Added **${currentVideo.title}** to queue.`);
                await i.editOriginal(
                    {
                        embeds: [embed.toJSON()]
                    }
                )
                const g = guilds[interaction.guildID as string]
                const ct = g.currentTrack;
                const t = g.queuedTracks[ct];
                const cst = t.trackNumber;
                const st = t.tracks[cst];
                g.queuedTracks.push(youtubeadd);
                debugLog(ct);
                debugLog(t);
                debugLog(cst);
                debugLog(st);
                if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection) playSong(st, interaction.guildID as string);
            }
            // play video next
            //@ts-ignore
            const vla = async i => {
                await i.defer();
                const g = guilds[interaction.guildID as string]
                const ct = g.currentTrack;
                const t = g.queuedTracks[ct];
                if (t.type === "playlist") {
                    const cst = t.trackNumber;
                    t.tracks.splice(cst + 1, 0, {
                        name: currentVideo.title,
                        url: currentVideo.url
                    })
                }
                else {
                    g.queuedTracks.push(
                        {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: currentVideo.title,
                                    url: currentVideo.url
                                }
                            ],
                            name: currentVideo.title
                        }
                    )
                }
                const embed = new builders.EmbedBuilder();
                embed.setDescription(`Playing **${currentVideo.title}** after current track.`);
                await i.editOriginal(
                    {
                        embeds: [embed.toJSON()]
                    }
                )
            }
            // @ts-ignore
            await interaction.editOriginal({components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()]})
            utils.LFGIC(client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Search${term}`, pl)
            utils.LFGIC(client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}Add${term}`,vl)
            utils.LFGIC(client, interaction.guildID as string, interaction.user.id, `${interaction.user.id}AddNext${term}`, vla)
            setTimeout(async () => {
                client.off("interactionCreate", pl);
                client.off("interactionCreate", vl);
                client.off("interactionCreate", vla);
                (actionRow as builders.ActionRow).getComponents().forEach((component) => component.disable());
                actionRow2.getComponents().forEach((component) => component.disable());
                // @ts-ignore
                await interaction.editOriginal({components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()]})
            }, 120000)
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "export")
        .setDescription("Export the current queue/playlist as a single string.")
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.STRING,
                required: true,
                name: "type",
                description: "What to export.",
                choices: [
                    {
                        name: "playlist",
                        value: "playlist"
                    },
                    {
                        name: "queue",
                        value: "queue"
                    }
                ]
            }
        ),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer()
            const type: "playlist" | "queue" = interaction.data.options.getString("type", true);
            const g = guilds[interaction.guildID as string];
            switch(type) {
                case "playlist":
                    const q = g.queuedTracks[g.currentTrack];
                    if (q.type === "song") {
                        const embed = new builders.EmbedBuilder();
                        embed.setDescription("The current track is not a playlist.")
                        return await interaction.editOriginal({embeds: [embed.toJSON()]});
                    }
                    const clone: queuedTrack = {
                        trackNumber: 0,
                        tracks: q.tracks,
                        type: "playlist",
                        name: q.name
                    };
                    const c = lzw.pack(clone);
                    const encoded = base64.encode(c.toString());
                    await interaction.editOriginal({content: "Exported playlist. Save this as a file:", files: [
                        {
                            name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                            contents: new Buffer(encoded)
                        }
                    ]});
                case "queue":
                    const qClone: queuedTrack[] = [];
                    for (const track of g.queuedTracks) {
                        qClone.push(track)
                    }
                    for (const clone of qClone) {
                        clone.trackNumber = 0;
                    }
                    const lzp = lzw.pack(qClone);
                    const q_enc = base64.encode(lzp.toString());
                    await interaction.editOriginal({content: "Exported queue. Save this as a file:", files: [
                        {
                            name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                            contents: new Buffer(q_enc)
                        }
                    ]});
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "import")
        .setDescription("Import a exported queue/playlist.")
        .addOption(
            {
                name: "encoded",
                type: oceanic.ApplicationCommandOptionTypes.ATTACHMENT,
                description: "The encoded queue/playlist.",
                required: true
            }
        ),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer()
            const g = guilds[interaction.guildID as string];
            const encoded = interaction.data.options.getAttachment("encoded", true);
            const data = await fetch(encoded.url, {
                method: "GET"
            });
            const encodedData = await data.text();
            const lzd = utils.decodeStr(encodedData);
            debugLog(lzd);
            if (lzd?.trackNumber !== undefined) {
                debugLog("found track number")
                g.queuedTracks.push(lzd);
            }
            else {
                debugLog("no track number, iterating.")
                for (const track of lzd) {
                    g.queuedTracks.push(track);
                }
            }
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Imported ${lzd.trackNumber !== undefined ? lzd.tracks.length : lzd.length} ${lzd.trackNumber !== undefined ? lzd.tracks.length > 1 ? "songs" : "song" : lzd.length > 1 ? "songs" : "song"} from ${encoded.filename}`);
            await interaction.editOriginal({embeds: [embed.toJSON()]});
            const ct = g.currentTrack;
            const t = g.queuedTracks[ct];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection) playSong(st, interaction.guildID as string);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "clear-queue")
        .setDescription("Clear the queue.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            if (interaction.guildID) {
                await interaction.defer()
                guilds[interaction.guildID].queuedTracks.splice(0, 5000);
                guilds[interaction.guildID].audioPlayer.stop(true);
                guilds[interaction.guildID].currentTrack = 0;
                const embed = new builders.EmbedBuilder()
                embed.setDescription("Cleared queue.")
                await interaction.editOriginal({embeds: [embed.toJSON()]});
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "join")
        .setDescription("Join a VC and start playing tracks if available.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            if (interaction.member?.voiceState?.channelID) {
                const g = guilds[interaction.guildID as string];
                if (g.connection) {
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription("I am already in a VC.");
                    return await interaction.editOriginal({embeds: [embed.toJSON()]});
                }
                g.connection = client.joinVoiceChannel({
                    channelID: interaction.member.voiceState.channelID,
                    guildID: interaction.guildID as string,
                    selfDeaf: true,
                    selfMute: false,
                    voiceAdapterCreator: interaction.guild?.voiceAdapterCreator as voice.DiscordGatewayAdapterCreator
                })
                g.connection.subscribe(g.audioPlayer)
                g.connection.on("error", (error: string | Error) => {
                    const id = interaction.channelID;
                    const ig = interaction.guild;
                    if (ig) {
                        const c = ig.channels.get(id) as oceanic.TextChannel
                        if (c) {
                            const embed = new builders.EmbedBuilder();
                            embed.setDescription("Connection had an error. Error is " + error);
                            c.createMessage({embeds: [embed.toJSON()]});
                        }
                    }
                })
                const ct = g.currentTrack;
                const qt = g.queuedTracks;
                const cst = qt[ct]?.trackNumber;
                const qst = qt[ct]?.tracks;
                const string = `Joined VC <#${interaction.member.voiceState.channelID}>${qt.length > 0 ? ` starting track **${qst[cst].name}**` : ""}`
                const embed = new builders.EmbedBuilder();
                embed.setDescription(string);
                await interaction.editOriginal({embeds: [embed.toJSON()]});
                if (qt.length > 0) {
                    playSong(qst[cst], interaction.guildID as string);
                }
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "pause")
        .setDescription("Pause current track.").setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const g = guilds[interaction.guildID as string];
            g.audioPlayer.pause();
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Paused track ${g.currentlyPlaying}`);
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "resume")
        .setDescription("Resume current track.").setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const g = guilds[interaction.guildID as string];
            g.audioPlayer.unpause();
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Resumed track ${g.currentlyPlaying}`);
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "shuffle")
        .setDescription("Shuffle the entire queue or the current playlist.")
        .addOption(
            {
                type: oceanic.ApplicationCommandOptionTypes.STRING,
                required: true,
                name: "type",
                description: "What to shuffle.",
                choices: [
                    {
                        name: "playlist",
                        value: "playlist"
                    },
                    {
                        name: "queue",
                        value: "queue"
                    }
                ]
            }
        )
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const shuffleType = interaction.data.options.getString("type", true);
            const g = guilds[interaction.guildID as string];
            const ct = g.queuedTracks[g.currentTrack];
            if (ct.type === "song" && shuffleType === "playlist") {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("The current track is a song, not a playlist.");
                return await interaction.editOriginal({embeds: [embed.toJSON()]});
            }
            g.audioPlayer.stop(true);
            g.currentTrack = 0;
            ct.trackNumber = 0;
            if (shuffleType === "playlist") {
                utils.shuffleArray(ct.tracks);
            }
            else {
                utils.shuffleArray(g.queuedTracks);
            }
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Shuffled queue, now playing ${ct.tracks[0].name}.`);
            await interaction.editOriginal({embeds: [embed.toJSON()]});
            playSong(ct.tracks[0], interaction.guildID as string);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "skip-song")
        .setDescription("Skip the current song.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            const embed = new builders.EmbedBuilder();
            const g = guilds[interaction.guildID as string];
            const ct = g.queuedTracks[g.currentTrack];
            let songName: string;
            if (ct.type == "song") {
                songName = ct.tracks[0].name;
                g.queuedTracks.splice(g.currentTrack, 1);
                g.currentTrack -= 1;
                if (g.currentTrack >= g.queuedTracks.length) ct.trackNumber = 0;
            }
            else {
                songName = ct.tracks[ct.trackNumber].name;
                ct.tracks.splice(ct.trackNumber, 1);
                ct.trackNumber -= 1;
                if (ct.trackNumber >= ct.tracks.length) ct.trackNumber = 0;
            }
            g.audioPlayer.stop();
            embed.setDescription(`Skipped song ${songName}.`);
            await interaction.createFollowup({embeds: [embed.toJSON()]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "skip-playlist")
        .setDescription("Skip the current playlist.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const embed = new builders.EmbedBuilder();
            const g = guilds[interaction.guildID as string];
            g.currentTrack -= 1;
            g.audioPlayer.stop()
            g.queuedTracks.splice(g.currentTrack, 1);
            if (g.currentTrack >= g.queuedTracks.length) g.currentTrack = 0;
            embed.setDescription(`Skipped current playlist.`);
            await interaction.createFollowup({embeds: [embed.toJSON()]})
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "loop")
        .setDescription("Loop a specific part of the queue.")
        .addOption(
            {
                type: 3,
                name: 'type',
                description: "What do you want to loop?",
                choices: [
                    {
                        name: "none", value: "none"
                    },
                    {
                        name: "song", value: "song"
                    },
                    {
                        name: "playlist", value: "playlist"
                    },
                    {
                        name: "queue", value: "queue"
                    }
                ],
                required: true
            }
        ).setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const choice: loopType = interaction.data.options.getString("type", true);
            const g = guilds[interaction.guildID as string];
            const embed = new builders.EmbedBuilder();
            embed.setDescription(loopTypeStrs[choice])
            g.loopType = choice;
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "leave")
        .setDescription("Leave the current VC.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const g = guilds[interaction.guildID as string];
            if (g.connection) {
                g.connection.disconnect();
                g.connection.destroy();
                g.voiceChannel = null;
                const embed = new builders.EmbedBuilder();
                embed.setDescription("Disconnected.");
                await interaction.editOriginal({embeds: [embed.toJSON()]});
            }
            else {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("I am not in a VC.");
                await interaction.editOriginal({embeds: [embed.toJSON()]});
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "add-playlist")
        .setDescription("Add a playlist to the queue.")
        .addOption(
            {
                name: 'playlist',
                description: "The playlist to add. Can also be a channel URL.",
                required: true,
                type: 3
            }
        )
        .addOption(
            {
                name: "shuffle",
                description: "Should the playlist be shuffled before being added to queue?",
                required: false,
                type: 5
            }
        )
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer();
            const playlist = interaction.data.options.getString("playlist", true);
            const shuffle = interaction.data.options.getBoolean("shuffle");
            if (!ytpl.validateID(playlist)) {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("Invalid playlist link.");
                await interaction.editOriginal({embeds: [embed.toJSON()]});
            }
            const videos = await ytpl(playlist);
            const added_playlist: queuedTrack = { 
                trackNumber: 0,
                tracks: [],
                type: "playlist",
                name: videos.title
            };
            for (const video of videos.items) {
                const obj: track = {
                    name: video.title,
                    url: video.url
                }
                added_playlist.tracks.push(obj);
            }
            if (shuffle) utils.shuffleArray(added_playlist.tracks);
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Added **${videos.items.length} tracks** to the queue as a playlist.`);
            const g = guilds[interaction.guildID as string]
            g.queuedTracks.push(added_playlist);
            const ct = g.currentTrack;
            const t = g.queuedTracks[ct];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection) playSong(st, interaction.guildID as string);
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "view-queue")
        .setDescription("View the queue.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer(1 << 6)
            await interaction.editOriginal({embeds: [embedMessage("Paging queued tracks. Please wait, as the time taken will vary depending on queue length.")], flags: 1 << 6})
            const data: {queued: PageHolder, tracks: PageHolder | null} = {
                queued: await utils.queuedTrackPager(guilds[interaction.guildID as string].queuedTracks, async (title) => {
                    await interaction.editOriginal({embeds: [embedMessage(`Paging track **${title}**`)], flags: 1 << 6})
                }),
                tracks: null
            }
            let isInspecting = false;
            let currentPage = 0;
            let currentInspectPage = 0;
            // make ids
            debugLog("making component ids")
            const nextEmbedId = rstring.generate();
            const prevEmbedId = rstring.generate();
            const inspectId = rstring.generate();
            const shuffleId = rstring.generate();
            const playNextId = rstring.generate();
            const nextInspectedId = rstring.generate();
            const prevInspectedId = rstring.generate();
            const exitInspectId = rstring.generate();
            const removeInspectedId = rstring.generate();
            const exportId = rstring.generate();
            const exitId = rstring.generate();
            // setup buttons
            debugLog("creating components")
            const nextEmbed = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextEmbedId);
            const prevEmbed = new builders.Button(oceanic.ButtonStyles.PRIMARY, prevEmbedId);
            const inspect = new builders.Button(oceanic.ButtonStyles.PRIMARY, inspectId);
            const shuffle = new builders.Button(oceanic.ButtonStyles.PRIMARY, shuffleId);
            const playNext = new builders.Button(oceanic.ButtonStyles.PRIMARY, playNextId);
            const nextInspected = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextInspectedId);
            const prevInspected = new builders.Button(oceanic.ButtonStyles.PRIMARY, prevInspectedId);
            const exitInspect = new builders.Button(oceanic.ButtonStyles.PRIMARY, exitInspectId);
            const removeInspected = new builders.Button(oceanic.ButtonStyles.PRIMARY, removeInspectedId);
            const exportB = new builders.Button(oceanic.ButtonStyles.PRIMARY, exportId);
            const exit = new builders.Button(oceanic.ButtonStyles.PRIMARY, exitId);
            // setup labels
            debugLog("setting labels")
            nextEmbed.setLabel("Next");
            prevEmbed.setLabel("Previous");
            inspect.setLabel("Inspect");
            shuffle.setLabel("Shuffle");
            playNext.setLabel("Play next");
            nextInspected.setLabel("Next song");
            prevInspected.setLabel("Previous song");
            exitInspect.setLabel("Exit inspect mode");
            removeInspected.setLabel("Remove inspected song");
            exportB.setLabel("Export viewed playlist");
            exit.setLabel("Stop viewing queue")
            // setup action rows
            const actionRows = {
                song: [
                    new builders.ActionRow().addComponents(playNext).toJSON(),
                    new builders.ActionRow().addComponents(prevEmbed, exit, nextEmbed).toJSON()
                ],
                playlist: [
                    new builders.ActionRow().addComponents(inspect, shuffle, playNext, exportB).toJSON(),
                    new builders.ActionRow().addComponents(prevEmbed, exit, nextEmbed).toJSON(),
                ],
                inspected: [
                    new builders.ActionRow().addComponents(removeInspected, exitInspect).toJSON(),
                    new builders.ActionRow().addComponents(prevInspected, nextInspected).toJSON()
                ],
                disabled: {
                    song: [
                        new builders.ActionRow().addComponents(playNext.disable()).toJSON(),
                        new builders.ActionRow().addComponents(prevEmbed.disable(), exit.disable(), nextEmbed.disable()).toJSON()
                    ],
                    playlist: [
                        new builders.ActionRow().addComponents(inspect.disable(), shuffle.disable(), playNext.disable(), exportB.disable()).toJSON(),
                        new builders.ActionRow().addComponents(prevEmbed.disable(), exit.disable(), nextEmbed.disable()).toJSON()
                    ],
                    inspected: [
                        new builders.ActionRow().addComponents(removeInspected.disable(), exitInspect.disable()).toJSON(),
                        new builders.ActionRow().addComponents(prevInspected.disable(), nextInspected.disable()).toJSON()
                    ],
                }
            }

            const onExit = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== exitId) return;
                /** @ts-ignore */
                client.off("interactionCreate", onNext);
                /** @ts-ignore */
                client.off("interactionCreate", onPrev);
                /** @ts-ignore */
                client.off("interactionCreate", onInspect);
                /** @ts-ignore */
                client.off("interactionCreate", onShuffle);
                /** @ts-ignore */
                client.off("interactionCreate", onPlayNext);
                /** @ts-ignore */
                client.off("interactionCreate", onExitInspect);
                /** @ts-ignore */
                client.off("interactionCreate", onRemoveInspected);
                /** @ts-ignore */
                client.off("interactionCreate", onExport);
                /** @ts-ignore */
                client.off("interactionCreate", onExit);
                /** @ts-ignore */
                await interaction.editOriginal({components: isInspecting ? actionRows.disabled.inspected : data.queued.pages[currentPage].type == "song" ? actionRows.disabled.song : actionRows.disabled.playlist})
                await i.createMessage({content: "Exited view.", flags: 1 << 6})
            }

            const onExport = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== exportId) return;
                await i.defer(1 << 6)
                const q = guilds[interaction.guildID as string].queuedTracks[currentPage]
                const clone: queuedTrack = {
                    trackNumber: 0,
                    tracks: q.tracks,
                    type: "playlist",
                    name: q.name
                };
                const c = lzw.pack(clone);
                const encoded = base64.encode(c.toString());
                await i.editOriginal({content: "Exported playlist. Save this as a file:", files: [
                    {
                        name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                        contents: new Buffer(encoded)
                    }
                ], flags: 1 << 6});
            }

            const onInspect = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== inspectId) return;
                currentInspectPage = 0;
                await i.createMessage({embeds: [embedMessage("Paging tracks for playlist.")], flags: 1 << 6});
                data.tracks = await utils.trackPager(guilds[interaction.guildID as string].queuedTracks[currentPage].tracks, async (title) => {
                    await i.editOriginal({embeds: [embedMessage(`Paging track **${title}**`)], flags: 1 << 6})
                });
                isInspecting = true;
                /** @ts-ignore */
                await interaction.editOriginal({content: "", embeds: data.tracks.pages[0].embed.toJSON(true), components: actionRows.inspected, flags: 1 << 6});
            }
            
            const onNext = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== nextEmbedId && i.data.customID !==  nextInspectedId) return;
                if (isInspecting && data.tracks) {
                    currentInspectPage += 1;
                    if (currentInspectPage === data.tracks.pages.length) currentInspectPage = 0;
                    const embed = data.tracks.pages[currentInspectPage].embed;
                    /** @ts-ignore */
                    await i.editParent({embeds: [embed.toJSON()], components: actionRows.inspected, flags: 1 << 6})
                }
                else {
                    currentPage += 1;
                    if (currentPage === data.queued.pages.length) currentPage = 0;
                    const current = data.queued.pages[currentPage];
                    /** @ts-ignore */
                    await i.editParent({content: "", embeds: current.embed.toJSON(true), components: current.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});
                }
            }

            const onPrev = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== prevEmbedId && i.data.customID !== prevInspectedId) return;
                if (isInspecting && data.tracks) {
                    currentInspectPage -= 1;
                    const embed = data.tracks.pages[currentInspectPage].embed;
                    /** @ts-ignore */
                    await i.editParent({embeds: [embed.toJSON()], components: actionRows.inspected, flags: 1 << 6})
                }
                else {
                    currentPage -= 1;
                    if (currentPage === -1) currentPage = data.queued.pages.length - 1;
                    const current = data.queued.pages[currentPage];
                    /** @ts-ignore */
                    await i.editParent({content: "", embeds: current.embed.toJSON(true), components: current.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});
                }
            }

            const onShuffle = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== shuffleId) return;
                const queueIndex = data.queued.pages[currentPage].index;
                debugLog(queueIndex);
                debugLog(guilds[i.guildID as string].queuedTracks[queueIndex].tracks)
                utils.shuffleArray(guilds[i.guildID as string].queuedTracks[queueIndex].tracks);
                debugLog(guilds[i.guildID as string].queuedTracks[queueIndex].tracks)
                await i.createMessage({embeds: [embedMessage("Shuffled playlist.")], flags: 1 << 6})
            }

            const onPlayNext = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== playNextId) return;
                await i.defer()
                const queueIndex = data.queued.pages[currentPage].index;
                const g = guilds[i.guildID as string];
                const queued = g.queuedTracks;
                const removed = queued.splice(queueIndex, 1);
                queued.splice(g.currentTrack, 0, removed[0]);
                await i.createMessage({embeds: [embedMessage("Playing " + removed[0].name + " next.")], flags: 1 << 6});
            }

            const onExitInspect = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== exitInspectId) return;
                isInspecting = false;
                await i.createMessage({embeds: [embedMessage("Exited inspect mode.")], flags: 1 << 6});
                const current = data.queued.pages[currentPage];
                /** @ts-ignore */
                await interaction.editOriginal({content: "", embeds: current.embed.toJSON(true), components: current.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});
            }

            const onRemoveInspected = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== removeInspectedId) return;
                await i.defer();
                const queueIndexes = {
                    queue: data.queued.pages[currentPage].index,
                    /** @ts-ignore */
                    track: data.tracks.pages[currentInspectPage].index
                }
                const g = guilds[i.guildID as string];
                g.queuedTracks[queueIndexes.queue].tracks.splice(queueIndexes.track, 1);
                data.tracks?.pages.splice(currentInspectPage, 1);
                /** @ts-ignore */
                const embed = data.tracks.pages[currentInspectPage].embed;
                /** @ts-ignore */
                await i.editParent({content: "",embeds: [embed.toJSON()], components: actionRows.inspected, flags: 1 << 6})
            }
            /** @ts-ignore */
            client.on("interactionCreate", onNext);
            /** @ts-ignore */
            client.on("interactionCreate", onPrev);
            /** @ts-ignore */
            client.on("interactionCreate", onInspect);
            /** @ts-ignore */
            client.on("interactionCreate", onShuffle);
            /** @ts-ignore */
            client.on("interactionCreate", onPlayNext);
            /** @ts-ignore */
            client.on("interactionCreate", onExitInspect);
            /** @ts-ignore */
            client.on("interactionCreate", onRemoveInspected);
            /** @ts-ignore */
            client.on("interactionCreate", onExport);
            /** @ts-ignore */
            client.on("interactionCreate", onExit)

            const currentpage = data.queued.pages[0];
            /** @ts-ignore */
            await interaction.editOriginal({content: "", embeds: currentpage.embed.toJSON(true), components: currentpage.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});

            setTimeout(async () => {
                /** @ts-ignore */
                client.off("interactionCreate", onNext);
                /** @ts-ignore */
                client.off("interactionCreate", onPrev);
                /** @ts-ignore */
                client.off("interactionCreate", onInspect);
                /** @ts-ignore */
                client.off("interactionCreate", onShuffle);
                /** @ts-ignore */
                client.off("interactionCreate", onPlayNext);
                /** @ts-ignore */
                client.off("interactionCreate", onExitInspect);
                /** @ts-ignore */
                client.off("interactionCreate", onRemoveInspected);
                /** @ts-ignore */
                client.off("interactionCreate", onExport);
                /** @ts-ignore */
                client.off("interactionCreate", onExit);
                if (isInspecting) {
                    /** @ts-ignore */
                    const embed = data.tracks?.pages[currentInspectPage].embed;
                    /** @ts-ignore */
                    await interaction.editOriginal({embeds: embed?.toJSON(true), components: actionRows.disabled.inspected, flags: 1 << 6});
                }
                else {
                    const current = data.queued.pages[currentPage]
                    const embed = current.embed;
                    /** @ts-ignore */
                    await interaction.editOriginal({embeds: embed?.toJSON(true), components: current.type === "playlist" ? actionRows.disabled.playlist : actionRows.disabled.song, flags: 1 << 6});
                }
            }, 720000)
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "create-playlist")
        .setDescription("Create a custom playlist.")
        .addOption({
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            required: true,
            name: "playlist-name",
            description: "Name of the playlist."
        })
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer(1 << 6);
            const name = interaction.data.options.getString("playlist-name", true);
            const data: queuedTrack = {
                type: "playlist",
                name: name,
                trackNumber: 0,
                tracks: []
            }
            const paged: PageData[] = []
            let currentTrack = 0;
            await interaction.editOriginal({embeds: [embedMessage("Creating component ids.")], flags: 1 << 6});
            // create component ids
            debugLog("creatiing component ids")
            const backId = rstring.generate();
            const nextId = rstring.generate();
            const addId = rstring.generate();
            const removeId = rstring.generate();
            const moveUpId = rstring.generate();
            const moveBackId = rstring.generate();
            const exportId = rstring.generate();
            const modalId = rstring.generate();
            // create components
            await interaction.editOriginal({embeds: [embedMessage("Creating components.")], flags: 1 << 6});
            const back = new builders.Button(oceanic.ButtonStyles.PRIMARY, backId);
            const next = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextId);
            const add = new builders.Button(oceanic.ButtonStyles.PRIMARY, addId);
            const remove = new builders.Button(oceanic.ButtonStyles.PRIMARY, removeId);
            const moveUp = new builders.Button(oceanic.ButtonStyles.PRIMARY, moveUpId);
            const moveBack = new builders.Button(oceanic.ButtonStyles.PRIMARY, moveBackId);
            const exportB = new builders.Button(oceanic.ButtonStyles.PRIMARY, exportId)
            // set labels
            back.setLabel("Previous song");
            next.setLabel("Next song");
            add.setLabel("Add song");
            remove.setLabel("Remove song");
            moveUp.setLabel("Move song forwards");
            moveBack.setLabel("Move song backwards");
            exportB.setLabel("Export playlist (disables buttons)")
            // create component thingy
            const rows = {
                enabled: [
                    new builders.ActionRow().addComponents(moveBack, add, remove, moveUp).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                moveBackDisabled: [
                    new builders.ActionRow().addComponents(moveBack.disable(), add, remove, moveUp).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                moveUpDisabled: [
                    new builders.ActionRow().addComponents(moveBack.enable(), add, remove, moveUp.disable()).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                movesDisabled: [
                    new builders.ActionRow().addComponents(moveBack.disable(), add, remove, moveUp.disable()).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                disabled: [
                    new builders.ActionRow().addComponents(moveBack.disable(), add.disable(), remove.disable(), moveUp.disable()).toJSON(),
                    new builders.ActionRow().addComponents(back.disable(), exportB.disable(), next.disable()).toJSON()
                ],
            }
            // create callbacks

            const onExport = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== exportId) return;
                /** @ts-ignore */
                await i.editParent({embeds: [paged[currentTrack].embed.toJSON()], components: rows.disabled, flags: 1 << 6})
                const encoded = base64.encode(lzw.pack(data));
                await i.createFollowup({content: `Exported playlist **${name}**. Save this as a file:`, files: [
                    {
                        name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                        contents: new Buffer(encoded)
                    }
                ], flags: 1 << 6})
                /** @ts-ignore */
                client.off("interactionCreate", onBack);
                /** @ts-ignore */
                client.off("interactionCreate", onNext);
                /** @ts-ignore */
                client.off("interactionCreate", onRemove);
                /** @ts-ignore */
                client.off("interactionCreate", onAdd);
                /** @ts-ignore */
                client.off("interactionCreate", onMoveBack);
                /** @ts-ignore */
                client.off("interactionCreate", onMoveUp);
                /** @ts-ignore */
                client.off("interactionCreate", onExport);
            }

            const onBack = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== backId) return;
                currentTrack -= 1;
                if (currentTrack == -1) currentTrack = paged.length - 1;
                const embed = paged[currentTrack].embed;
                const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled)
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: components, flags: 1 << 6})
            }

            const onNext = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== nextId) return;
                currentTrack += 1;
                if (currentTrack == paged.length) currentTrack = 0;
                debugLog(paged);
                const embed = paged[currentTrack].embed;
                const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled)
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: components, flags: 1 << 6})
            }
            
            const onMoveBack = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== moveBackId) return;
                const currentData = {
                    paged: paged.splice(currentTrack, 1)[0],
                    track: data.tracks.splice(currentTrack, 1)[0]
                }
                debugLog(paged);
                currentData.paged.index -= 1
                for (const field of currentData.paged.embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (currentData.paged.index).toString();
                    }
                }
                paged[currentTrack - 1].index += 1;
                for (const field of paged[currentTrack - 1].embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (paged[currentTrack- 1].index).toString();
                    }
                }
                paged.splice(currentTrack - 1, 0, currentData.paged);
                debugLog(paged);
                data.tracks.splice(currentTrack - 1, 0, currentData.track);
                const embed = paged[currentTrack].embed;
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: rows.enabled, flags: 1 << 6});
                await i.createFollowup({embeds: [embedMessage(`Moved track **${currentData.track.name}** backwards.`)], flags: 1 << 6});
            }

            const onMoveUp = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== moveUpId) return;
                const currentData = {
                    paged: paged.splice(currentTrack, 1)[0],
                    track: data.tracks.splice(currentTrack, 1)[0]
                }
                debugLog(paged);
                currentData.paged.index += 1
                for (const field of currentData.paged.embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (currentData.paged.index).toString();
                    }
                }
                paged[currentTrack].index -= 1;
                for (const field of paged[currentTrack].embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (paged[currentTrack].index).toString();
                    }
                }
                paged.splice(currentTrack + 1, 0, currentData.paged);
                debugLog(paged)
                data.tracks.splice(currentTrack + 1, 0, currentData.track);
                const embed = paged[currentTrack].embed;
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: rows.enabled, flags: 1 << 6});
                await i.createFollowup({embeds: [embedMessage(`Moved track **${currentData.track.name}** forwards.`)], flags: 1 << 6});
            }
            
            const onRemove = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== removeId) return;
                if (paged[currentTrack] == undefined) return;
                const splicedData = {
                    paged: paged.splice(currentTrack, 1),
                    track: data.tracks.splice(currentTrack, 1)
                }
                for (const page of paged) {
                    if (page.index > splicedData.paged[0].index) {
                        for (const field of page.embed.getFields()) {
                            if (field.name == "index") field.value = (parseInt(field.value) - 1).toString();
                        }
                    }
                }
                if (currentTrack == paged.length) currentTrack = paged.length - 1;
                if (data.tracks.length > 0) {
                    const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled)
                    /** @ts-ignore */
                    await i.editParent({embeds: [paged[currentTrack].embed.toJSON()], components: components, flags: 1 << 6})
                }
                else {
                    /** @ts-ignore */
                    await interaction.editOriginal({embeds: [embedMessage("No songs yet. Use the components to add some!")], components: rows.movesDisabled, flags: 1 << 6})
                }
                await i.createFollowup({embeds: [embedMessage(`Removed track **${splicedData.track[0].name}**`)], flags: 1 << 6});
            }

            const addCallback = async (int: oceanic.AnyModalSubmitInteraction, resolve: any) => {
                if (int.data.customID !== modalId) return;
                if (!int.acknowledged) await int.defer(1 << 6);
                const video = int.data.components[0].components[0].value as string;
                const provider = getProvider(video)
                if (provider == undefined) {
                    return int.editOriginal({embeds: [embedMessage("Invalid song link.")], flags: 1 << 6});
                }
                switch(provider) {
                    case "youtube":
                        try {
                            if (!ytdl.validateURL(video)) {
                                const embed = new builders.EmbedBuilder()
                                embed.setDescription("Invalid link.")
                                return await int.editOriginal({embeds: [embed.toJSON()], flags: 1 << 6});
                            }
                            const info = await playdl.video_basic_info(video);
                            const title = info.video_details.title as string;
                            const youtubeadd: track = {
                                name: title,
                                url: video
                            }
                            data.tracks.push(youtubeadd);
                            /** @ts-ignore */
                            const pagedTrack: PageData = await utils.pageTrack(youtubeadd);
                            pagedTrack.index = paged.length;
                            pagedTrack.embed.addField("index", pagedTrack.index.toString(), true)
                            paged.push(pagedTrack)
                            const yembed = new builders.EmbedBuilder();
                            yembed.setDescription(`Added **${title}** to custom playlist.`);
                            await int.editOriginal({embeds: [yembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                    // both deezer and spotify need to be searched up on youtube
                    case "deezer":
                        try {
                            const dvid = await playdl.deezer(video);
                            if (dvid.type !== "track") {
                                const dembed = new builders.EmbedBuilder();
                                dembed.setDescription(`**${dvid.title}** is not a Deezer track! This only supports singular tracks.`);
                                return await int.editOriginal({embeds: [dembed.toJSON()], flags: 1 << 6})
                            }
                            const yvid = (await playdl.search(dvid.title, {
                                limit: 1
                            }))[0]
                            const deezeradd: track = {
                                name: dvid.title,
                                url: yvid.url
                            }
                            data.tracks.push(deezeradd)
                            /** @ts-ignore */
                            const pagedDeezer: PageData = await utils.pageTrack(deezeradd);
                            pagedDeezer.index = paged.length;
                            pagedDeezer.embed.addField("index", pagedDeezer.index.toString(), true)
                            paged.push(pagedDeezer)
                            const dembed = new builders.EmbedBuilder();
                            dembed.setDescription(`Added **${dvid.title}** to custom playlist.`);
                            await int.editOriginal({embeds: [dembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                    case "spotify":
                        try {
                            try {
                                if (playdl.is_expired()) {
                                    await playdl.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                                }
                            } catch {}
                            const sp_data = await playdl.spotify(video);

                            if (sp_data.type !== "track") {
                                const dembed = new builders.EmbedBuilder();
                                dembed.setDescription(`**${sp_data.name}** is not a Spotify track! This only supports singular tracks.`);
                                return await int.editOriginal({embeds: [dembed.toJSON()], flags: 1 << 6})
                            }

                            const search = (await playdl.search(sp_data.name, { limit: 1}))[0];
                            const spotifyadd: track = {
                                name: sp_data.name,
                                url: search.url
                            }
                            data.tracks.push(spotifyadd)
                            /** @ts-ignore */
                            const pagedSpotify: PageData = await utils.pageTrack(spotifyadd);
                            pagedSpotify.index = paged.length;
                            pagedSpotify.embed.addField("index", pagedSpotify.index.toString(), true)
                            paged.push(pagedSpotify)
                            const spembed = new builders.EmbedBuilder();
                            spembed.setDescription(`Added **${sp_data.name}** to custom playlist.`);
                            await int.editOriginal({embeds: [spembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                    case "soundcloud":
                        try {
                            const sinfo = await playdl.soundcloud(video);
                            const sc_add: track = {
                                name: sinfo.name,
                                url: video
                            }
                            data.tracks.push(sc_add)
                            /** @ts-ignore */
                            const pagedSoundcloud: PageData = await utils.pageTrack(sc_add);
                            pagedSoundcloud.index = paged.length;
                            pagedSoundcloud.embed.addField("index", pagedSoundcloud.index.toString(), true)
                            paged.push(pagedSoundcloud)
                            const scembed = new builders.EmbedBuilder();
                            scembed.setDescription(`Added **${sinfo.name}** to custom playlist.`);
                            await int.editOriginal({embeds: [scembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                }
            }

            const onAdd = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== addId) return;
                const modalRow = new builders.ActionRow();
                const inputId = rstring.generate();
                const input = new builders.TextInput(oceanic.TextInputStyles.SHORT, "url", inputId);
                input.setLabel("song url")
                input.setRequired(true);
                modalRow.addComponents(input);
                /** @ts-ignore */
                await i.createModal({components: [modalRow.toJSON()], customID: modalId, title: "Add song to playlist."});
                let callback
                await new Promise((resolve) => {
                    callback = async (inter: oceanic.AnyModalSubmitInteraction) => {
                        await addCallback(inter, resolve);
                    }
                    /** @ts-ignore */
                    client.on("interactionCreate", callback)
                    setTimeout(() => {
                        /** @ts-ignore */
                        client.off("interactionCreate", async (inter: oceanic.AnyModalSubmitInteraction) => {
                            await addCallback(inter, resolve);
                        })
                    }, 180000)
                })
                /** @ts-ignore */
                client.off("interactionCreate", callback)
                if (data.tracks.length == 1) {
                    /** @ts-ignore */
                    await interaction.editOriginal({embeds: [paged[currentTrack].embed.toJSON()], components: rows.movesDisabled, flags: 1 << 6})
                }
            }

            /** @ts-ignore */
            await interaction.editOriginal({embeds: [embedMessage("No songs yet. Use the components to add some!")], components: rows.movesDisabled, flags: 1 << 6})

            /** @ts-ignore */
            client.on("interactionCreate", onBack);
            /** @ts-ignore */
            client.on("interactionCreate", onNext);
            /** @ts-ignore */
            client.on("interactionCreate", onRemove);
            /** @ts-ignore */
            client.on("interactionCreate", onAdd);
            /** @ts-ignore */
            client.on("interactionCreate", onMoveBack);
            /** @ts-ignore */
            client.on("interactionCreate", onMoveUp);
            /** @ts-ignore */
            client.on("interactionCreate", onExport);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "edit-playlist")
        .setDescription("Edit a custom playlist.")
        .addOption({
            type: oceanic.ApplicationCommandOptionTypes.ATTACHMENT,
            required: true,
            name: "playlist",
            description: "Playlist file."
        })
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            await interaction.defer(1 << 6);
            const attachment = interaction.data.options.getAttachment("playlist", true);
            const text = await (await fetch(attachment.proxyURL)).text();
            const data = utils.decodeStr(text);
            const paged: PageData[] = []
            let currentTrack = 0;
            await interaction.editOriginal({embeds: [embedMessage("Creating component ids.")], flags: 1 << 6});
            // create component ids
            debugLog("creating component ids")
            const backId = rstring.generate();
            const nextId = rstring.generate();
            const addId = rstring.generate();
            const removeId = rstring.generate();
            const moveUpId = rstring.generate();
            const moveBackId = rstring.generate();
            const exportId = rstring.generate();
            const modalId = rstring.generate();
            // create components
            await interaction.editOriginal({embeds: [embedMessage("Creating components.")], flags: 1 << 6});
            const back = new builders.Button(oceanic.ButtonStyles.PRIMARY, backId);
            const next = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextId);
            const add = new builders.Button(oceanic.ButtonStyles.PRIMARY, addId);
            const remove = new builders.Button(oceanic.ButtonStyles.PRIMARY, removeId);
            const moveUp = new builders.Button(oceanic.ButtonStyles.PRIMARY, moveUpId);
            const moveBack = new builders.Button(oceanic.ButtonStyles.PRIMARY, moveBackId);
            const exportB = new builders.Button(oceanic.ButtonStyles.PRIMARY, exportId)
            // set labels
            back.setLabel("Previous song");
            next.setLabel("Next song");
            add.setLabel("Add song");
            remove.setLabel("Remove song");
            moveUp.setLabel("Move song forwards");
            moveBack.setLabel("Move song backwards");
            exportB.setLabel("Export playlist (disables buttons)")
            // create component thingy
            const rows = {
                enabled: [
                    new builders.ActionRow().addComponents(moveBack, add, remove, moveUp).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                moveBackDisabled: [
                    new builders.ActionRow().addComponents(moveBack.disable(), add, remove, moveUp).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                moveUpDisabled: [
                    new builders.ActionRow().addComponents(moveBack.enable(), add, remove, moveUp.disable()).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                movesDisabled: [
                    new builders.ActionRow().addComponents(moveBack.disable(), add, remove, moveUp.disable()).toJSON(),
                    new builders.ActionRow().addComponents(back, exportB, next).toJSON()
                ],
                disabled: [
                    new builders.ActionRow().addComponents(moveBack.disable(), add.disable(), remove.disable(), moveUp.disable()).toJSON(),
                    new builders.ActionRow().addComponents(back.disable(), exportB.disable(), next.disable()).toJSON()
                ],
            }
            // create callbacks

            const onExport = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== exportId) return;
                /** @ts-ignore */
                await i.editParent({embeds: [paged[currentTrack].embed.toJSON()], components: rows.disabled, flags: 1 << 6})
                const encoded = base64.encode(lzw.pack(data));
                await i.createFollowup({content: `Exported playlist **${name}**. Save this as a file:`, files: [
                    {
                        name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                        contents: new Buffer(encoded)
                    }
                ], flags: 1 << 6})
                /** @ts-ignore */
                client.off("interactionCreate", onBack);
                /** @ts-ignore */
                client.off("interactionCreate", onNext);
                /** @ts-ignore */
                client.off("interactionCreate", onRemove);
                /** @ts-ignore */
                client.off("interactionCreate", onAdd);
                /** @ts-ignore */
                client.off("interactionCreate", onMoveBack);
                /** @ts-ignore */
                client.off("interactionCreate", onMoveUp);
                /** @ts-ignore */
                client.off("interactionCreate", onExport);
            }

            const onBack = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== backId) return;
                currentTrack -= 1;
                if (currentTrack == -1) currentTrack = paged.length - 1;
                const embed = paged[currentTrack].embed;
                const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled)
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: components, flags: 1 << 6})
            }

            const onNext = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== nextId) return;
                currentTrack += 1;
                if (currentTrack == paged.length) currentTrack = 0;
                debugLog(paged);
                const embed = paged[currentTrack].embed;
                const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled)
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: components, flags: 1 << 6})
            }
            
            const onMoveBack = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== moveBackId) return;
                const currentData = {
                    paged: paged.splice(currentTrack, 1)[0],
                    track: data.tracks.splice(currentTrack, 1)[0]
                }
                debugLog(paged);
                currentData.paged.index -= 1
                for (const field of currentData.paged.embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (currentData.paged.index).toString();
                    }
                }
                paged[currentTrack - 1].index += 1;
                for (const field of paged[currentTrack - 1].embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (paged[currentTrack- 1].index).toString();
                    }
                }
                paged.splice(currentTrack - 1, 0, currentData.paged);
                debugLog(paged);
                data.tracks.splice(currentTrack - 1, 0, currentData.track);
                const embed = paged[currentTrack].embed;
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: rows.enabled, flags: 1 << 6});
                await i.createFollowup({embeds: [embedMessage(`Moved track **${currentData.track.name}** backwards.`)], flags: 1 << 6});
            }

            const onMoveUp = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== moveUpId) return;
                const currentData = {
                    paged: paged.splice(currentTrack, 1)[0],
                    track: data.tracks.splice(currentTrack, 1)[0]
                }
                debugLog(paged);
                currentData.paged.index += 1
                for (const field of currentData.paged.embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (currentData.paged.index).toString();
                    }
                }
                paged[currentTrack].index -= 1;
                for (const field of paged[currentTrack].embed.getFields()) {
                    if (field.name === "index") {
                        field.value = (paged[currentTrack].index).toString();
                    }
                }
                paged.splice(currentTrack + 1, 0, currentData.paged);
                debugLog(paged)
                data.tracks.splice(currentTrack + 1, 0, currentData.track);
                const embed = paged[currentTrack].embed;
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: rows.enabled, flags: 1 << 6});
                await i.createFollowup({embeds: [embedMessage(`Moved track **${currentData.track.name}** forwards.`)], flags: 1 << 6});
            }
            
            const onRemove = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== removeId) return;
                if (paged[currentTrack] == undefined) return;
                const splicedData = {
                    paged: paged.splice(currentTrack, 1),
                    track: data.tracks.splice(currentTrack, 1)
                }
                for (const page of paged) {
                    if (page.index > splicedData.paged[0].index) {
                        for (const field of page.embed.getFields()) {
                            if (field.name == "index") field.value = (parseInt(field.value) - 1).toString();
                        }
                    }
                }
                if (currentTrack == paged.length) currentTrack = paged.length - 1;
                if (data.tracks.length > 0) {
                    const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled)
                    /** @ts-ignore */
                    await i.editParent({embeds: [paged[currentTrack].embed.toJSON()], components: components, flags: 1 << 6})
                }
                else {
                    /** @ts-ignore */
                    await interaction.editOriginal({embeds: [embedMessage("No songs yet. Use the components to add some!")], components: rows.movesDisabled, flags: 1 << 6})
                }
                await i.createFollowup({embeds: [embedMessage(`Removed track **${splicedData.track[0].name}**`)], flags: 1 << 6});
            }

            const addCallback = async (int: oceanic.AnyModalSubmitInteraction, resolve: any) => {
                if (int.data.customID !== modalId) return;
                if (!int.acknowledged) await int.defer(1 << 6);
                const video = int.data.components[0].components[0].value as string;
                const provider = getProvider(video)
                if (provider == undefined) {
                    return int.editOriginal({embeds: [embedMessage("Invalid song link.")], flags: 1 << 6});
                }
                switch(provider) {
                    case "youtube":
                        try {
                            if (!ytdl.validateURL(video)) {
                                const embed = new builders.EmbedBuilder()
                                embed.setDescription("Invalid link.")
                                return await int.editOriginal({embeds: [embed.toJSON()], flags: 1 << 6});
                            }
                            const info = await playdl.video_basic_info(video);
                            const title = info.video_details.title as string;
                            const youtubeadd: track = {
                                name: title,
                                url: video
                            }
                            data.tracks.push(youtubeadd);
                            /** @ts-ignore */
                            const pagedTrack: PageData = await utils.pageTrack(youtubeadd);
                            pagedTrack.index = paged.length;
                            pagedTrack.embed.addField("index", pagedTrack.index.toString(), true)
                            paged.push(pagedTrack)
                            const yembed = new builders.EmbedBuilder();
                            yembed.setDescription(`Added **${title}** to custom playlist.`);
                            await int.editOriginal({embeds: [yembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                    // both deezer and spotify need to be searched up on youtube
                    case "deezer":
                        try {
                            const dvid = await playdl.deezer(video);
                            if (dvid.type !== "track") {
                                const dembed = new builders.EmbedBuilder();
                                dembed.setDescription(`**${dvid.title}** is not a Deezer track! This only supports singular tracks.`);
                                return await int.editOriginal({embeds: [dembed.toJSON()], flags: 1 << 6})
                            }
                            const yvid = (await playdl.search(dvid.title, {
                                limit: 1
                            }))[0]
                            const deezeradd: track = {
                                name: dvid.title,
                                url: yvid.url
                            }
                            data.tracks.push(deezeradd)
                            /** @ts-ignore */
                            const pagedDeezer: PageData = await utils.pageTrack(deezeradd);
                            pagedDeezer.index = paged.length;
                            pagedDeezer.embed.addField("index", pagedDeezer.index.toString(), true)
                            paged.push(pagedDeezer)
                            const dembed = new builders.EmbedBuilder();
                            dembed.setDescription(`Added **${dvid.title}** to custom playlist.`);
                            await int.editOriginal({embeds: [dembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                    case "spotify":
                        try {
                            try {
                                if (playdl.is_expired()) {
                                    await playdl.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                                }
                            } catch {}
                            const sp_data = await playdl.spotify(video);

                            if (sp_data.type !== "track") {
                                const dembed = new builders.EmbedBuilder();
                                dembed.setDescription(`**${sp_data.name}** is not a Spotify track! This only supports singular tracks.`);
                                return await int.editOriginal({embeds: [dembed.toJSON()], flags: 1 << 6})
                            }

                            const search = (await playdl.search(sp_data.name, { limit: 1}))[0];
                            const spotifyadd: track = {
                                name: sp_data.name,
                                url: search.url
                            }
                            data.tracks.push(spotifyadd)
                            /** @ts-ignore */
                            const pagedSpotify: PageData = await utils.pageTrack(spotifyadd);
                            pagedSpotify.index = paged.length;
                            pagedSpotify.embed.addField("index", pagedSpotify.index.toString(), true)
                            paged.push(pagedSpotify)
                            const spembed = new builders.EmbedBuilder();
                            spembed.setDescription(`Added **${sp_data.name}** to custom playlist.`);
                            await int.editOriginal({embeds: [spembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                    case "soundcloud":
                        try {
                            const sinfo = await playdl.soundcloud(video);
                            const sc_add: track = {
                                name: sinfo.name,
                                url: video
                            }
                            data.tracks.push(sc_add)
                            /** @ts-ignore */
                            const pagedSoundcloud: PageData = await utils.pageTrack(sc_add);
                            pagedSoundcloud.index = paged.length;
                            pagedSoundcloud.embed.addField("index", pagedSoundcloud.index.toString(), true)
                            paged.push(pagedSoundcloud)
                            const scembed = new builders.EmbedBuilder();
                            scembed.setDescription(`Added **${sinfo.name}** to custom playlist.`);
                            await int.editOriginal({embeds: [scembed.toJSON()], flags: 1 << 6})
                            resolve();
                        } catch (err) {
                            await int.editOriginal({embeds: [embedMessage(`Encountered an error: ${err}`)]})
                        }
                        break;
                }
            }

            const onAdd = async (i: oceanic.ComponentInteraction) => {
                if (i.data.customID !== addId) return;
                const modalRow = new builders.ActionRow();
                const inputId = rstring.generate();
                const input = new builders.TextInput(oceanic.TextInputStyles.SHORT, "url", inputId);
                input.setLabel("song url")
                input.setRequired(true);
                modalRow.addComponents(input);
                /** @ts-ignore */
                await i.createModal({components: [modalRow.toJSON()], customID: modalId, title: "Add song to playlist."});
                let callback
                await new Promise((resolve) => {
                    callback = async (inter: oceanic.AnyModalSubmitInteraction) => {
                        await addCallback(inter, resolve);
                    }
                    /** @ts-ignore */
                    client.on("interactionCreate", callback)
                    setTimeout(() => {
                        /** @ts-ignore */
                        client.off("interactionCreate", async (inter: oceanic.AnyModalSubmitInteraction) => {
                            await addCallback(inter, resolve);
                        })
                    }, 180000)
                })
                /** @ts-ignore */
                client.off("interactionCreate", callback)
                if (data.tracks.length == 1) {
                    /** @ts-ignore */
                    await interaction.editOriginal({embeds: [paged[currentTrack].embed.toJSON()], components: rows.movesDisabled, flags: 1 << 6})
                }
            }

            /** @ts-ignore */
            await interaction.editOriginal({embeds: [embedMessage("No songs yet. Use the components to add some!")], components: rows.movesDisabled, flags: 1 << 6})

            /** @ts-ignore */
            client.on("interactionCreate", onBack);
            /** @ts-ignore */
            client.on("interactionCreate", onNext);
            /** @ts-ignore */
            client.on("interactionCreate", onRemove);
            /** @ts-ignore */
            client.on("interactionCreate", onAdd);
            /** @ts-ignore */
            client.on("interactionCreate", onMoveBack);
            /** @ts-ignore */
            client.on("interactionCreate", onMoveUp);
            /** @ts-ignore */
            client.on("interactionCreate", onExport);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "set-volume")
        .setDescription("Set the volume for the bot within the current guild.")
        .addOption(
            {
                name: "volume",
                type: oceanic.ApplicationCommandOptionTypes.STRING,
                required: true,
                description: "The volume to set to. Can contain a percent (ex. 50%) or a decimal number (ex. 1.2)."
            }
        )
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            const volume = interaction.data.options.getString("volume", true);
            const characterRegex = /^[0-9%.]*$/g;
            if (characterRegex.test(volume)) {
                const parsed = utils.parseVolumeString(volume);
                const cg = guilds[(interaction.guild as oceanic.Guild).id]
                cg.volume = parsed;
                cg.currentResource?.volume?.setVolume(parsed);
                const ap = cg.audioPlayer;
                ap.stop();
                if (cg.queuedTracks[cg.currentTrack]) playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], interaction.guildID as string);
                await interaction.createMessage({embeds: [embedMessage(`Set volume for ${(interaction.guild as oceanic.Guild).id} to ${volume}, parsed: ${parsed}`)]});
            }
            else {
                await interaction.createMessage({embeds: [embedMessage(`Volume ${volume} contains invalid characters! volume can only contain the characters 0-9, . and %`)]});
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "server-info")
        .setDescription("See info about the server as the bot has it stored.")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            const id = interaction.guildID as string;
            const g = guilds[id];
            const embed = new builders.EmbedBuilder();
            embed.setTitle(`Info for ${(interaction.guild as oceanic.Guild).name}`);
            embed.addField("Current song", g.currentlyPlaying || "None", true);
            embed.addField("Loop type", g.loopType, true);
            embed.addField("Volume", g.volume.toString()), true;
            embed.addField("Connected channel", g.voiceChannel?.name || "Not connected", true);
            embed.addField("Current index in queue", g.currentTrack.toString(), true);
            embed.addField("Current index in song/playlist", g.queuedTracks[g.currentTrack]?.trackNumber.toString() || "No current playlist/song", true);
            embed.addField("Amount of queued tracks", g.queuedTracks.length.toString(), true);
            embed.addField("Amount of tracks in current song/playlist", g.queuedTracks[g.currentTrack]?.tracks.length.toString() || "No current playlist/song"), true;
            embed.addField("Name of current playlist", g.queuedTracks[g.currentTrack]?.name || "No current playlist/song", true);
            await interaction.createMessage({embeds: [embed.toJSON()]});
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "progress")
        .setDescription("Get progress of current song (if any).")
        .setDMPermission(false),
        async execute(interaction: oceanic.CommandInteraction) {
            const g = interaction.guild as oceanic.Guild;
            const cg = guilds[g.id];
            const songTime = cg.currentResource?.playbackDuration;
            const progressTime = cg.songStart;
            const embed = new builders.EmbedBuilder();
            if (cg.queuedTracks[cg.currentTrack] !== undefined && songTime && progressTime && cg.currentInfo) {
                const remaining = humanize(songTime - progressTime, {round: true});
                const ct = cg.queuedTracks[cg.currentTrack];
                embed.setTitle(`Progress for ${ct.tracks[ct.trackNumber].name}`);
                embed.addField("Time remaining", remaining);
                embed.addField("Song duration", humanize(progressTime));
                embed.addField("Author", cg.currentInfo.video_details.channel?.name || "None found.");
                embed.addField("Likes", cg.currentInfo.video_details.likes.toString());
                embed.addField("Views", cg.currentInfo.video_details.views.toString());
                embed.setImage(utils.getHighestResUrl(cg.currentInfo));
            }
            else {
                embed.setTitle(`No song currently playing or available.`);
            }
            await interaction.createMessage({embeds: [embed.toJSON()]});
        }
    }
];

client.on('ready', async () => {
    if (setup) return console.log("why did it ready more than once");
    // add all guilds
    for (const guild of client.guilds.entries()) {
        guilds[guild[1].id] = {
            queuedTracks: [],
            connection: null,
            loopType: "none",
            currentTrack: 0,
            voiceChannel: null,
            currentlyPlaying: null,
            audioPlayer: createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause
                }
            }),
            volume: 1,
            leaveTimer: null,
            currentResource: null,
            songStart: null,
            currentInfo: null
        }

        setupGuild(guild[1]);
    }
    // go through commands
    for (const command of commands) {
        console.log(`creating global command ${command.data.name}`);
        ccommands.set(command.data.name, command);
        // @ts-ignore
        await client.application.createGlobalCommand(command.data);
        console.log(`created global command ${command.data.name}`);
    }
    client.editStatus("online", [{name: (client.guilds.size).toString() + ' servers', type: 3}]);

    setup = true;
})

// @ts-ignore
client.on('interactionCreate', async (interaction: oceanic.CommandInteraction) => {
    const command = ccommands.get(interaction.data.name);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        
        if (!interaction.acknowledged) {
            await interaction.createFollowup({content: `There was an error while executing this command, error is ${error}`});
        }
        else await interaction.editOriginal({content: `There was an error while executing this command, error is ${error}`});
    }
});

// finally, connect the client

client.connect();