import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
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
    callback: async (interaction, resolvers, guild) => {
        await interaction.defer();
        const video = interaction.data.options.getString("link", true);
        const next = interaction.data.options.getBoolean("next");
        const provider = await resolvers.songResolvers.find(async (resolver) => await resolver.resolve(video))?.resolve(video);
        if (provider === undefined) {
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Could not get video/music provider for the link you provided.`);
            return await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
        if (interaction.guildID) {
            const queue = guild.queue;
            const ct = queue.internalCurrentIndex;
            const nowPlaying = queue.tracks[ct];
            const qt = queue.tracks;
            const resolver = resolvers.songDataResolvers.find((resolver) => resolver.regexMatches.find((reg) => reg.test(video)));
            if (resolver) {
                const song_data = await resolver.resolve(video);
                if (typeof song_data != "string") {
                    const song_add = {
                        type: "song",
                        trackNumber: 0,
                        tracks: [
                            {
                                name: song_data.title,
                                url: song_data.url
                            }
                        ],
                        name: song_data.title
                    };
                    if (next) {
                        if (nowPlaying.type === "playlist") {
                            nowPlaying.tracks.push({
                                name: song_data.title,
                                url: song_data.url
                            });
                        }
                        else {
                            qt.splice(ct + 1, 0, song_add);
                        }
                    }
                    else {
                        queue.tracks.push(song_add);
                    }
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription(`Added **${song_data.title}** to queue.`);
                    await interaction.editOriginal({ embeds: [embed.toJSON()] });
                }
                else {
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription(song_data);
                    await interaction.editOriginal({ embeds: [embed.toJSON()] });
                }
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
                await queue.play(resolvers);
        }
    }
};
