import { Collection } from 'discord.js';
import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import utils from '../utils/utils.js';
import * as voice from "@discordjs/voice";
import { default as playdl } from 'play-dl';
import humanize from 'humanize-duration';
import ytdl from 'ytdl-core';
import { createAudioPlayer, NoSubscriberBehavior, createAudioResource } from "@discordjs/voice";
import ytpl from 'ytpl';
import * as util from "node:util";
// @ts-ignore
import { default as lzw } from "lzwcompress";
import base64 from "base-64";
// util functions
function startsWith(str, strings) {
    for (const string of strings) {
        if (str.startsWith(string))
            return true;
    }
    return false;
}
function getProvider(url) {
    // no clue if these are all, please open an issue if they are not
    const youtube = ["https://www.youtube.com", "https://youtu.be", "https://music.youtube.com"];
    const sc = ["https://soundcloud.com", "https://on.soundcloud.com"];
    const deezer = ["https://www.deezer.com"];
    const spotify = ["https://open.spotify.com"];
    if (startsWith(url, youtube))
        return "youtube";
    if (startsWith(url, sc))
        return "soundcloud";
    if (startsWith(url, deezer))
        return "deezer";
    if (startsWith(url, spotify))
        return "spotify";
}
function setupGuild(guild) {
    const cg = guilds[guild.id];
    cg.audioPlayer.on('error', (error) => {
        console.log(`an error occured with the audio player, ${error}`);
    });
    cg.audioPlayer.on("stateChange", () => {
        if (cg.audioPlayer.state.status == voice.AudioPlayerStatus.Idle) {
            console.log(util.inspect(cg.queuedTracks, true, 20));
            switch (cg.loopType) {
                case "none":
                    if (cg.queuedTracks[cg.currentTrack].type === "playlist") {
                        cg.queuedTracks[cg.currentTrack].tracks.splice(0, 1);
                        if (cg.queuedTracks[cg.currentTrack].tracks.length === 0) {
                            cg.queuedTracks.splice(0, 1);
                            playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                        }
                        else {
                            playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                        }
                    }
                    else {
                        cg.queuedTracks[cg.currentTrack].tracks.splice(0, 1);
                        playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    }
                    break;
                case "song":
                    playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    break;
                case "queue":
                    console.log(cg.currentTrack);
                    if (cg.queuedTracks[cg.currentTrack].type === "playlist") {
                        cg.queuedTracks[cg.currentTrack].trackNumber += 1;
                    }
                    else {
                        cg.currentTrack += 1;
                    }
                    if (cg.currentTrack >= cg.queuedTracks.length)
                        cg.currentTrack = 0;
                    if (cg.queuedTracks[cg.currentTrack].trackNumber >= cg.queuedTracks[cg.currentTrack].tracks.length)
                        cg.currentTrack += 1;
                    if (cg.currentTrack >= cg.queuedTracks.length)
                        cg.currentTrack = 0;
                    console.log(cg.currentTrack);
                    playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    break;
                case "playlist":
                    if (cg.queuedTracks[cg.currentTrack].tracks.length <= cg.queuedTracks[cg.currentTrack].trackNumber || cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber + 1] === undefined) {
                        cg.queuedTracks[cg.currentTrack].trackNumber = 0;
                    }
                    else {
                        cg.queuedTracks[cg.currentTrack].trackNumber += 1;
                    }
                    playSong(cg.queuedTracks[cg.currentTrack].tracks[cg.queuedTracks[cg.currentTrack].trackNumber], guild.id);
                    break;
            }
        }
    });
}
// starter variables
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const { token } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));
const guilds = {};
const loopTypeStrs = {
    "none": "No longer looping anything.",
    "song": "Looping the currently playing song.",
    "playlist": "Looping the currently playing playlist (same as song if the current track was added as a song)",
    "queue": "Looping the entire queue."
};
// main client and listeners
const client = new oceanic.Client({
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
    if (client.getVoiceConnection(oldState.guildID) === undefined && guilds[oldState.guildID].connection) {
        const connection = guilds[oldState.guildID].connection;
        connection.disconnect();
        guilds[oldState.guildID].connection = null;
        guilds[oldState.guildID].voiceChannel = null;
    }
    else {
        if (guilds[oldState.guildID].voiceChannel !== null && guilds[oldState.guildID].connection) {
            const channel = guilds[oldState.guildID].voiceChannel;
            const connection = guilds[oldState.guildID].connection;
            console.log(channel.voiceMembers.size);
            if (channel.voiceMembers.size == 1) {
                guilds[oldState.guildID].leaveTimer = setTimeout(() => {
                    connection.disconnect();
                    connection.destroy();
                    guilds[oldState.guildID].connection = null;
                    guilds[oldState.guildID].voiceChannel = null;
                }, 60 * 1000);
            }
            else {
                if (guilds[oldState.guildID].leaveTimer != null)
                    clearTimeout(guilds[oldState.guildID].leaveTimer);
            }
        }
    }
});
client.on("ready", () => {
    console.log("logged in");
});
client.on('error', (error) => {
    console.error(`something went wrong, ${error}`);
});
// music playback
async function playSong(track, guild) {
    const currentGuild = guilds[guild];
    const stream = await playdl.stream(track.url);
    const resource = createAudioResource(stream.stream, {
        inlineVolume: true,
        inputType: stream.type
    });
    resource.volume?.setVolume(currentGuild.volume);
    currentGuild.currentlyPlaying = track.name;
    currentGuild.audioPlayer.play(resource);
}
// start commands
const ccommands = new Collection();
client.on('guildCreate', (guild) => {
    guilds[guild.id] = {
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
        volume: 0.05,
        leaveTimer: null
    };
    setupGuild(guild);
    client.editStatus("online", [{ type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers' }]);
});
client.on('guildDelete', (guild) => {
    guilds[guild.id].audioPlayer.removeAllListeners();
    delete guilds[guild.id];
    client.editStatus("online", [{ type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers' }]);
});
const commands = [
    {
        data: new builders.ApplicationCommandBuilder(oceanic.ApplicationCommandTypes.CHAT_INPUT, "add-url")
            .setDescription("Add a link to the queue.")
            .addOption({
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            name: "link",
            description: "Link to add.",
            required: true
        })
            .addOption({
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN,
            name: "next",
            description: "Should this song play next? This will either add it in the current playlist, or in the queue.",
            required: false
        }).setDMPermission(false),
        async execute(interaction) {
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
                https://open.spotify.com`);
                return await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
            if (interaction.guildID) {
                const ct = guilds[interaction.guildID].currentTrack;
                const nowPlaying = guilds[interaction.guildID].queuedTracks[ct];
                const qt = guilds[interaction.guildID].queuedTracks;
                switch (provider) {
                    case "youtube":
                        if (!ytdl.validateURL(video)) {
                            const embed = new builders.EmbedBuilder();
                            embed.setDescription("Invalid link.");
                            return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                        }
                        const info = await ytdl.getInfo(video);
                        const title = info.videoDetails.title;
                        const youtubeadd = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: title,
                                    url: video
                                }
                            ]
                        };
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push({
                                    name: title,
                                    url: video
                                });
                            }
                            else {
                                qt.splice(ct + 1, 0, youtubeadd);
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(youtubeadd);
                        }
                        const yembed = new builders.EmbedBuilder();
                        yembed.setDescription(`Added ${title} to queue.`);
                        await interaction.editOriginal({ embeds: [yembed.toJSON()] });
                        break;
                    // both deezer and spotify need to be searched up on youtube
                    case "deezer":
                        const dvid = await playdl.deezer(video);
                        if (dvid.type !== "track") {
                            const dembed = new builders.EmbedBuilder();
                            dembed.setDescription(`${dvid.title} is not a Deezer track! add-url only supports singular tracks.`);
                            return await interaction.editOriginal({ embeds: [dembed.toJSON()] });
                        }
                        const yvid = (await playdl.search(dvid.title, {
                            limit: 1
                        }))[0];
                        const deezeradd = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: dvid.title,
                                    url: yvid.url
                                }
                            ]
                        };
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push({
                                    name: dvid.title,
                                    url: yvid.url
                                });
                            }
                            else {
                                qt.splice(ct + 1, 0, deezeradd);
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(deezeradd);
                        }
                        const dembed = new builders.EmbedBuilder();
                        dembed.setDescription(`Added ${dvid.title} to queue.`);
                        await interaction.editOriginal({ embeds: [dembed.toJSON()] });
                        break;
                    case "spotify":
                        if (playdl.is_expired()) {
                            await playdl.refreshToken(); // This will check if access token has expired or not. If yes, then refresh the token.
                        }
                        const sp_data = await playdl.spotify(video);
                        if (sp_data.type !== "track") {
                            const dembed = new builders.EmbedBuilder();
                            dembed.setDescription(`${sp_data.name} is not a Spotify track! add-url only supports singular tracks.`);
                            return await interaction.editOriginal({ embeds: [dembed.toJSON()] });
                        }
                        const search = (await playdl.search(sp_data.name, { limit: 1 }))[0];
                        const spotifyadd = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: sp_data.name,
                                    url: search.url
                                }
                            ]
                        };
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push({
                                    name: sp_data.name,
                                    url: search.url
                                });
                            }
                            else {
                                qt.splice(ct + 1, 0, spotifyadd);
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(spotifyadd);
                        }
                        const spembed = new builders.EmbedBuilder();
                        spembed.setDescription(`Added ${sp_data.name} to queue.`);
                        await interaction.editOriginal({ embeds: [spembed.toJSON()] });
                        break;
                    case "soundcloud":
                        const sinfo = await playdl.soundcloud(video);
                        const sc_add = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: sinfo.name,
                                    url: video
                                }
                            ]
                        };
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push({
                                    name: sinfo.name,
                                    url: video
                                });
                            }
                            else {
                                qt.splice(ct + 1, 0, sc_add);
                            }
                        }
                        else {
                            guilds[interaction.guildID].queuedTracks.push(sc_add);
                        }
                        const scembed = new builders.EmbedBuilder();
                        scembed.setDescription(`Added ${sinfo.name} to queue.`);
                        await interaction.editOriginal({ embeds: [scembed.toJSON()] });
                        break;
                }
                const ctn = guilds[interaction.guildID].currentTrack;
                const t = guilds[interaction.guildID].queuedTracks[ctn];
                const cst = t.trackNumber;
                const st = t.tracks[cst];
                if (guilds[interaction.guildID].audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guilds[interaction.guildID].connection)
                    playSong(st, interaction.guildID);
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "search")
            .setDescription("Add video(s) from the search results of a specific search term.")
            .addOption({
            name: "term",
            description: "What to search for.",
            required: true,
            type: 3
        })
            .addOption({
            name: "exclude-playlist",
            description: "Exclude playlists?",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
        })
            .addOption({
            name: "exclude-channel",
            description: "Exclude channels?",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
        })
            .addOption({
            name: "exclude-video",
            description: "Exclude videos?",
            required: false,
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN
        })
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const term = interaction.data.options.getString('term', true);
            const excludes = [];
            const enames = [
                "exclude-playlist",
                "exclude-channel",
                "exclude-video"
            ];
            for (const name of enames) {
                if (interaction.data.options.getBoolean(name) === true) {
                    excludes.push(name.split("-")[1]);
                }
            }
            const results = await playdl.search(term);
            const searches = [];
            const names = {};
            let currentVideo;
            for (const item of results) {
                if (!excludes.includes(item.type)) {
                    const embed = new builders.EmbedBuilder();
                    embed.setImage(item.thumbnails[0].url);
                    embed.setTitle(item.title);
                    if (item.uploadedAt)
                        embed.addField('Uploaded', item.uploadedAt);
                    if (item.channel?.name)
                        embed.addField("Author", item.channel.name);
                    if (item.views)
                        embed.addField("Views", item.views.toString());
                    if (item.durationInSec)
                        embed.addField("Duration", humanize(item.durationInSec * 1000));
                    names[item.title] = {
                        embed: embed,
                        url: item.url,
                        title: item.title
                    };
                    // @ts-ignore
                    if (!currentVideo)
                        currentVideo = {
                            embed: embed,
                            url: item.url,
                            title: item.title
                        };
                    searches.push({ name: item.title });
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
                const values = i.data.values.getStrings();
                const embed = names[values[0]].embed;
                currentVideo = names[values[0]];
                try {
                    // @ts-ignore
                    await i.editParent({ components: [actionRow, actionRow2], embeds: [embed.toJSON()] });
                }
                catch { }
            };
            // add video to queue
            // @ts-ignore
            const vl = async (i) => {
                await i.defer();
                const youtubeadd = {
                    type: "song",
                    trackNumber: 0,
                    tracks: [
                        {
                            name: currentVideo.title,
                            url: currentVideo.url
                        }
                    ]
                };
                guilds[interaction.guildID].queuedTracks.push(youtubeadd);
                const embed = new builders.EmbedBuilder();
                embed.setDescription(`Added **${currentVideo.title}** to queue.`);
                await i.editOriginal({
                    embeds: [embed.toJSON()]
                });
                const g = guilds[interaction.guildID];
                const ct = g.currentTrack;
                const t = g.queuedTracks[ct];
                const cst = t.trackNumber;
                const st = t.tracks[cst];
                if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection)
                    playSong(st, interaction.guildID);
            };
            // play video next
            //@ts-ignore
            const vla = async (i) => {
                await i.defer();
                const g = guilds[interaction.guildID];
                const ct = g.currentTrack;
                const t = g.queuedTracks[ct];
                if (t.type === "playlist") {
                    const cst = t.trackNumber;
                    t.tracks.splice(cst + 1, 0, {
                        name: currentVideo.title,
                        url: currentVideo.url
                    });
                }
                else {
                    g.queuedTracks.push({
                        type: "song",
                        trackNumber: 0,
                        tracks: [
                            {
                                name: currentVideo.title,
                                url: currentVideo.url
                            }
                        ]
                    });
                }
                const embed = new builders.EmbedBuilder();
                embed.setDescription(`Playing **${currentVideo.title}** after current track.`);
                await i.editOriginal({
                    embeds: [embed.toJSON()]
                });
            };
            // @ts-ignore
            await interaction.editOriginal({ components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()] });
            utils.LFGIC(client, interaction.guildID, interaction.user.id, `${interaction.user.id}Search${term}`, pl);
            utils.LFGIC(client, interaction.guildID, interaction.user.id, `${interaction.user.id}Add${term}`, vl);
            utils.LFGIC(client, interaction.guildID, interaction.user.id, `${interaction.user.id}AddNext${term}`, vla);
            setTimeout(async () => {
                client.off("interactionCreate", pl);
                client.off("interactionCreate", vl);
                client.off("interactionCreate", vla);
                actionRow.getComponents().forEach((component) => component.disable());
                actionRow2.getComponents().forEach((component) => component.disable());
                // @ts-ignore
                await interaction.editOriginal({ components: [actionRow, actionRow2], embeds: [currentVideo.embed.toJSON()] });
            }, 120000);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "export")
            .setDescription("Export the current queue/playlist as a single string.")
            .addOption({
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
        }),
        async execute(interaction) {
            await interaction.defer();
            const type = interaction.data.options.getString("type", true);
            const g = guilds[interaction.guildID];
            switch (type) {
                case "playlist":
                    const q = g.queuedTracks[g.currentTrack];
                    if (q.type === "song") {
                        const embed = new builders.EmbedBuilder();
                        embed.setDescription("The current track is not a playlist.");
                        return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                    }
                    const clone = {
                        trackNumber: 0,
                        tracks: q.tracks,
                        type: "playlist"
                    };
                    const c = lzw.pack(clone);
                    const encoded = base64.encode(c.toString());
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription(encoded);
                    embed.setTitle("This is your exported playlist.");
                    return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                case "queue":
                    const qClone = [];
                    for (const track of g.queuedTracks) {
                        qClone.push(track);
                    }
                    for (const clone of qClone) {
                        clone.trackNumber = 0;
                    }
                    const lzp = lzw.pack(qClone);
                    const q_enc = base64.encode(lzp.toString());
                    await interaction.editOriginal({ content: "Exported queue:", files: [
                            {
                                name: `${interaction.member.id}.export.txt`,
                                contents: new Buffer(q_enc)
                            }
                        ] });
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "import")
            .setDescription("Import a exported queue/playlist.")
            .addOption({
            name: "encoded",
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            description: "The encoded queue/playlist.",
            required: true
        }),
        async execute(interaction) {
            await interaction.defer();
            const g = guilds[interaction.guildID];
            const encoded = interaction.data.options.getString("encoded", true);
            const decode = base64.decode(encoded);
            const arr = decode.split(",");
            const numbers = [];
            for (const string of arr) {
                numbers.push(parseInt(string));
            }
            const lzd = lzw.unpack(numbers);
            if (lzd.trackNumber) {
                g.queuedTracks.push(lzd);
            }
            else {
                for (const track of lzd) {
                    g.queuedTracks.push(track);
                }
            }
            const embed = new builders.EmbedBuilder();
            embed.setTitle(`Imported ${lzd.trackNumber !== undefined ? lzd.tracks.length : lzd.length} ${lzd.trackNumber !== undefined ? lzd.tracks.length > 1 ? "songs" : "song" : lzd.length > 1 ? "songs" : "song"}.`);
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
            const ct = g.currentTrack;
            const t = g.queuedTracks[ct];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection)
                playSong(st, interaction.guildID);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "clear-queue")
            .setDescription("Clear the queue.")
            .setDMPermission(false),
        async execute(interaction) {
            if (interaction.guildID) {
                await interaction.defer();
                guilds[interaction.guildID].queuedTracks.splice(0, 5000);
                guilds[interaction.guildID].audioPlayer.stop(true);
                guilds[interaction.guildID].currentTrack = 0;
                const embed = new builders.EmbedBuilder();
                embed.setDescription("Cleared queue.");
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "join")
            .setDescription("Join a VC and start playing tracks if available.")
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            if (interaction.member?.voiceState?.channelID) {
                const g = guilds[interaction.guildID];
                if (g.connection) {
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription("I am already in a VC.");
                    return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                }
                g.connection = client.joinVoiceChannel({
                    channelID: interaction.member.voiceState.channelID,
                    guildID: interaction.guildID,
                    selfDeaf: true,
                    selfMute: false,
                    voiceAdapterCreator: interaction.guild?.voiceAdapterCreator
                });
                g.connection.subscribe(g.audioPlayer);
                g.connection.on("error", (error) => {
                    const id = interaction.channelID;
                    const ig = interaction.guild;
                    if (ig) {
                        const c = ig.channels.get(id);
                        if (c) {
                            const embed = new builders.EmbedBuilder();
                            embed.setDescription("Connection had an error. Error is " + error);
                            c.createMessage({ embeds: [embed.toJSON()] });
                        }
                    }
                });
                const ct = g.currentTrack;
                const qt = g.queuedTracks;
                const cst = qt[ct]?.trackNumber;
                const qst = qt[ct]?.tracks;
                const string = `Joined VC <#${interaction.member.voiceState.channelID}>${qt.length > 0 ? `starting track **${qst[cst].name}**` : ""}`;
                const embed = new builders.EmbedBuilder();
                embed.setDescription(string);
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
                if (qt.length > 0) {
                    playSong(qst[cst], interaction.guildID);
                }
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "pause")
            .setDescription("Pause current track.").setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const g = guilds[interaction.guildID];
            g.audioPlayer.pause();
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Paused track ${g.currentlyPlaying}`);
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "resume")
            .setDescription("Resume current track.").setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const g = guilds[interaction.guildID];
            g.audioPlayer.unpause();
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Resumed track ${g.currentlyPlaying}`);
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "shuffle")
            .setDescription("Shuffle the entire queue or the current playlist.")
            .addOption({
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
        })
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const shuffleType = interaction.data.options.getString("type", true);
            const g = guilds[interaction.guildID];
            const ct = g.queuedTracks[g.currentTrack];
            if (ct.type === "song" && shuffleType === "playlist") {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("The current track is a song, not a playlist.");
                return await interaction.editOriginal({ embeds: [embed.toJSON()] });
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
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
            playSong(ct.tracks[0], interaction.guildID);
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "skip-song")
            .setDescription("Skip the current song.")
            .setDMPermission(false),
        async execute(interaction) {
            const embed = new builders.EmbedBuilder();
            const g = guilds[interaction.guildID];
            const ct = g.queuedTracks[g.currentTrack];
            let songName;
            if (ct.type == "song") {
                songName = ct.tracks[0].name;
                g.queuedTracks.splice(g.currentTrack, 1);
                g.currentTrack -= 1;
                if (g.currentTrack >= g.queuedTracks.length)
                    ct.trackNumber = 0;
            }
            else {
                songName = ct.tracks[ct.trackNumber].name;
                ct.tracks.splice(ct.trackNumber, 1);
                ct.trackNumber -= 1;
                if (ct.trackNumber >= ct.tracks.length)
                    ct.trackNumber = 0;
            }
            g.audioPlayer.stop();
            embed.setDescription(`Skipped song ${songName}.`);
            await interaction.createFollowup({ embeds: [embed.toJSON()] });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "skip-playlist")
            .setDescription("Skip the current playlist.")
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const embed = new builders.EmbedBuilder();
            const g = guilds[interaction.guildID];
            g.currentTrack -= 1;
            g.audioPlayer.stop();
            g.queuedTracks.splice(g.currentTrack, 1);
            if (g.currentTrack >= g.queuedTracks.length)
                g.currentTrack = 0;
            embed.setDescription(`Skipped current playlist.`);
            await interaction.createFollowup({ embeds: [embed.toJSON()] });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "loop")
            .setDescription("Loop a specific part of the queue.")
            .addOption({
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
        }).setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const choice = interaction.data.options.getString("type", true);
            const g = guilds[interaction.guildID];
            const embed = new builders.EmbedBuilder();
            embed.setDescription(loopTypeStrs[choice]);
            g.loopType = choice;
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "leave")
            .setDescription("Leave the current VC.")
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const g = guilds[interaction.guildID];
            if (g.connection) {
                g.connection.disconnect();
                g.connection.destroy();
                g.voiceChannel = null;
                const embed = new builders.EmbedBuilder();
                embed.setDescription("Disconnected.");
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
            else {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("I am not in a VC.");
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
        }
    },
    {
        data: new builders.ApplicationCommandBuilder(1, "add-playlist")
            .setDescription("Add a playlist to the queue.")
            .addOption({
            name: 'playlist',
            description: "The playlist to add. Can also be a channel URL.",
            required: true,
            type: 3
        })
            .addOption({
            name: "shuffle",
            description: "Should the playlist be shuffled before being added to queue?",
            required: false,
            type: 5
        })
            .setDMPermission(false),
        async execute(interaction) {
            await interaction.defer();
            const playlist = interaction.data.options.getString("playlist", true);
            const shuffle = interaction.data.options.getBoolean("shuffle");
            if (!ytpl.validateID(playlist)) {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("Invalid playlist link.");
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
            const videos = await ytpl(playlist);
            const added_playlist = {
                trackNumber: 0,
                tracks: [],
                type: "playlist"
            };
            for (const video of videos.items) {
                const obj = {
                    name: video.title,
                    url: video.url
                };
                added_playlist.tracks.push(obj);
            }
            if (shuffle)
                utils.shuffleArray(added_playlist.tracks);
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Added **${videos.items.length} tracks** to the queue as a playlist.`);
            const g = guilds[interaction.guildID];
            g.queuedTracks.push(added_playlist);
            const ct = g.currentTrack;
            const t = g.queuedTracks[ct];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            if (g.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && g.connection)
                playSong(st, interaction.guildID);
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    }
];
client.on('ready', async () => {
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
            volume: 0.05,
            leaveTimer: null
        };
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
    client.editStatus("online", [{ type: oceanic.ActivityTypes.WATCHING, name: (client.guilds.size).toString() + ' servers' }]);
});
// @ts-ignore
client.on('interactionCreate', async (interaction) => {
    const command = ccommands.get(interaction.data.name);
    if (!command)
        return;
    try {
        await command.execute(interaction);
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
// finally, connect the client
client.connect();
