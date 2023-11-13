import * as builders from "@oceanicjs/builders";
import ytpl from "ytpl";
import utils from "../utils.js";
import * as voice from "@discordjs/voice";
export default {
    name: "add-playlist",
    description: "Add a playlist to the queue.",
    options: [
        {
            name: 'playlist',
            description: "The playlist to add. Can also be a channel URL.",
            required: true,
            type: 3
        },
        {
            name: "shuffle",
            description: "Should the playlist be shuffled before being added to queue?",
            required: false,
            type: 5
        }
    ],
    callback: async (interaction, resolvers, guild) => {
        await interaction.defer();
        const playlist = interaction.data.options.getString("playlist", true);
        const shuffle = interaction.data.options.getBoolean("shuffle");
        let videos = undefined;
        if (!ytpl.validateID(playlist)) {
            const resolver = resolvers.playlistResolvers.find((resolver) => resolver.regexMatches.find((reg) => reg.test(playlist)));
            if (resolver == undefined) {
                const embed = new builders.EmbedBuilder();
                embed.setDescription("Invalid playlist link.");
                await interaction.editOriginal({ embeds: [embed.toJSON()] });
            }
            else {
                const resolved = await resolver.resolve(playlist);
                videos = resolved;
            }
        }
        else {
            // @ts-ignore
            videos = await ytpl(playlist);
        }
        if (videos == undefined) {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("Invalid playlist link.");
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
        else {
            const added_playlist = {
                trackNumber: 0,
                tracks: [],
                type: "playlist",
                name: videos.title
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
            const queue = guild.queue;
            queue.tracks.push(added_playlist);
            if (guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guild.connection)
                await queue.play();
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    }
};
