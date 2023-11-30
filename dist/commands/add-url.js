import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import playdl from "play-dl";
import util from "util";
import * as voice from "@discordjs/voice";
import { debugLog } from "../bot.js";
playdl.getFreeClientID().then((val) => playdl.setToken({
    soundcloud: {
        client_id: val
    }
}));
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
        const nameResolvers = await resolvers.getNameResolvers(video);
        let provider;
        for (const resolver of nameResolvers) {
            if (await resolver.resolve(video)) {
                provider = await resolver.resolve(video);
                break;
            }
        }
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
            const s_resolvers = await resolvers.getSongResolvers(video);
            let resolver;
            for (const s_res of s_resolvers) {
                const output = await s_res.resolve(video);
                if (output && typeof output != "string") {
                    resolver = output;
                    break;
                }
            }
            if (resolver) {
                const song_add = {
                    type: "song",
                    trackNumber: 0,
                    tracks: [
                        {
                            name: resolver.title,
                            url: resolver.url
                        }
                    ],
                    name: resolver.title
                };
                if (next) {
                    if (nowPlaying.type === "playlist") {
                        nowPlaying.tracks.push({
                            name: resolver.title,
                            url: resolver.url
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
                embed.setDescription(`Added **${resolver.title}** to queue.`);
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
            else {
                const embed = new builders.EmbedBuilder();
                embed.setDescription(`Could nt resolve provided song.`);
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
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
