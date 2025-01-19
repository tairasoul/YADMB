import * as builders from "@oceanicjs/builders";
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
        },
        {
            name: "force-invalidation",
            description: "Should invalidation be forced for the cache on this playlist?",
            required: false,
            type: 5
        }
    ],
    callback: async (interaction, info) => {
        await interaction.defer();
        const playlist = interaction.data.options.getString("playlist", true);
        const shuffle = interaction.data.options.getBoolean("shuffle");
        const forceInvalidation = interaction.data.options.getBoolean("force-invalidation") ?? false;
        let videos = undefined;
        const p_resolvers = await (await info.resolvers.getPlaylistResolvers(playlist));
        if (p_resolvers.length == 0) {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("Invalid playlist link.");
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
        else {
            for (const resolver of p_resolvers) {
                const resolved = await resolver.resolve(playlist, info.cache, info.proxyInfo, forceInvalidation);
                if (typeof resolved == "string") {
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription(resolved);
                    return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                }
                else {
                    videos = resolved;
                    break;
                }
            }
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
            const queue = info.guild.queue;
            queue.tracks.push(added_playlist);
            if (info.guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && info.guild.connection)
                await queue.play(info.resolvers, info.proxyInfo);
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    }
};
