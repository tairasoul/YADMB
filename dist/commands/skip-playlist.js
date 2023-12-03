import * as builders from "@oceanicjs/builders";
export default {
    name: "skip-playlist",
    description: "Skip the current playlist.",
    callback: async (interaction, _resolvers, guild) => {
        await interaction.defer();
        const embed = new builders.EmbedBuilder();
        const queue = guild.queue;
        guild.audioPlayer.stop();
        queue.tracks.splice(queue.internalCurrentIndex, 1);
        if (queue.internalCurrentIndex >= queue.tracks.length)
            queue.internalCurrentIndex = 0;
        embed.setDescription(`Skipped current playlist.`);
        await interaction.editOriginal({ embeds: [embed.toJSON()] });
    }
};
