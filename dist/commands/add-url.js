import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import ytdl from "ytdl-core";
import playdl from "play-dl";
import util from "util";
import * as voice from "@discordjs/voice";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${path.join(__dirname, "..")}/enableDebugging`))
    debug = true;
function debugLog(text) {
    if (debug)
        console.log(text);
}
playdl.getFreeClientID().then((val) => playdl.setToken({
    soundcloud: {
        client_id: val
    }
}));
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
export default {
    name: "add-url",
    description: "Add a link to the queue.",
    options: [
        {
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            name: "link",
            description: "Link to add.",
            required: true
        },
        {
            type: oceanic.ApplicationCommandOptionTypes.BOOLEAN,
            name: "next",
            description: "Should this song play next? This will either add it in the current playlist, or in the queue.",
            required: false
        }
    ],
    callback: async (interaction, guild) => {
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
            const queue = guild.queue;
            const ct = queue.internalCurrentIndex;
            const nowPlaying = queue.tracks[ct];
            const qt = queue.tracks;
            switch (provider) {
                case "youtube":
                    if (!ytdl.validateURL(video)) {
                        const embed = new builders.EmbedBuilder();
                        embed.setDescription("Invalid link.");
                        return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                    }
                    const info = await playdl.video_basic_info(video);
                    const title = info.video_details.title;
                    const youtubeadd = {
                        type: "song",
                        trackNumber: 0,
                        tracks: [
                            {
                                name: title,
                                url: video
                            }
                        ],
                        name: title
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
                        queue.tracks.push(youtubeadd);
                    }
                    const yembed = new builders.EmbedBuilder();
                    yembed.setDescription(`Added **${title}** to queue.`);
                    await interaction.editOriginal({ embeds: [yembed.toJSON()] });
                    break;
                // both deezer and spotify need to be searched up on youtube
                case "deezer":
                    const dvid = await playdl.deezer(video);
                    if (dvid.type !== "track") {
                        const dembed = new builders.EmbedBuilder();
                        dembed.setDescription(`**${dvid.title}** is not a Deezer track! add-url only supports singular tracks.`);
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
                        ],
                        name: dvid.title
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
                        queue.tracks.push(deezeradd);
                    }
                    const dembed = new builders.EmbedBuilder();
                    dembed.setDescription(`Added **${dvid.title}** to queue.`);
                    await interaction.editOriginal({ embeds: [dembed.toJSON()] });
                    break;
                case "spotify":
                    try {
                        if (playdl.is_expired()) {
                            await playdl.refreshToken(); // This will check if access token has expired or not. If yes, then refresh the token.
                        }
                    }
                    catch { }
                    const sp_data = await playdl.spotify(video);
                    if (sp_data.type !== "track") {
                        const dembed = new builders.EmbedBuilder();
                        dembed.setDescription(`**${sp_data.name}** is not a Spotify track! add-url only supports singular tracks.`);
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
                        ],
                        name: sp_data.name
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
                        queue.tracks.push(spotifyadd);
                    }
                    const spembed = new builders.EmbedBuilder();
                    spembed.setDescription(`Added **${sp_data.name}** to queue.`);
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
                        ],
                        name: sinfo.name
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
                        queue.tracks.push(sc_add);
                    }
                    const scembed = new builders.EmbedBuilder();
                    scembed.setDescription(`Added **${sinfo.name}** to queue.`);
                    await interaction.editOriginal({ embeds: [scembed.toJSON()] });
                    break;
            }
            const ctn = queue.internalCurrentIndex;
            const t = queue.tracks[ctn];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            debugLog(`guilds["${interaction.guildID}"].queue.internalCurrentIndex: ${ctn}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ctn]: ${util.inspect(t, false, 5, true)}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ctn].trackNumber: ${cst}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ctn].tracks[cst]: ${util.inspect(st, false, 5, true)}`);
            if (guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guild.connection)
                await queue.play();
        }
    }
};
