import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation, queuedTrack } from "../client.js";
import * as builders from "@oceanicjs/builders"
import ytdl from "@distube/ytdl-core";
import playdl from "play-dl";
import util from "util";
import * as voice from "@discordjs/voice";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${path.join(__dirname, "..")}/enableDebugging`)) debug = true;

function debugLog(text: any) {
    if (debug) console.log(text)
}

playdl.getFreeClientID().then((val) => 
    playdl.setToken({
        soundcloud: {
            client_id: val
        }
    })
)

function startsWith(str: string, strings: string[]) {
    for (const string of strings) {
        if (str.startsWith(string)) return true;
    }
    return false
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
    callback: async (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild) => {
        await interaction.defer();
        const video = interaction.data.options.getString("link", true);
        const next = interaction.data.options.getBoolean("next");
        const provider = await resolvers.songResolvers.find(async (resolver) => await resolver.resolve(video))?.resolve(video);
        if (provider === undefined) {
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Could not get video/music provider for the link you provided.`)
            return await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
        if (interaction.guildID) {
            const queue = guild.queue;
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
                        queue.tracks.push(youtubeadd);
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
                        queue.tracks.push(deezeradd);                        
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
                        queue.tracks.push(spotifyadd);
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
                        queue.tracks.push(sc_add);
                    }
                    const scembed = new builders.EmbedBuilder();
                    scembed.setDescription(`Added **${sinfo.name}** to queue.`);
                    await interaction.editOriginal({embeds: [scembed.toJSON()]})
                    break;
                default:
                    const resolver = resolvers.songDataResolvers.find((resolver) => resolver.regexMatches.find((reg) => reg.test(video)));
                    if (resolver) {
                        const song_data = await resolver.resolve(video);
                        const song_add: queuedTrack = {
                            type: "song",
                            trackNumber: 0,
                            tracks: [
                                {
                                    name: song_data.title,
                                    url: song_data.url
                                }
                            ],
                            name: song_data.title
                        }
                        if (next) {
                            if (nowPlaying.type === "playlist") {
                                nowPlaying.tracks.push(
                                    {
                                        name: song_data.title,
                                        url: song_data.url
                                    }
                                )
                            }
                            else {
                                qt.splice(ct + 1, 0, song_add)
                            }
                        }
                        else {
                            queue.tracks.push(song_add);
                        }
                        const embed = new builders.EmbedBuilder();
                        embed.setDescription(`Added **${song_data.title}** to queue.`);
                        await interaction.editOriginal({embeds: [embed.toJSON()]})
                    }
                    break;
            }
            const ctn = queue.internalCurrentIndex;
            const t = queue.tracks[ctn];
            const cst = t.trackNumber;
            const st = t.tracks[cst];
            debugLog(`guilds["${interaction.guildID}"].queue.internalCurrentIndex: ${ctn}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ctn]: ${util.inspect(t, false, 5, true)}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ctn].trackNumber: ${cst}`);
            debugLog(`guilds["${interaction.guildID}"].queue.tracks[ctn].tracks[cst]: ${util.inspect(st, false, 5, true)}`)
            if (guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guild.connection) await queue.play();
        }
    }
}