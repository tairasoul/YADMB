import * as builders from "@oceanicjs/builders";
export default {
    name: "clear-queue",
    description: "Clear the queue.",
    callback: async (interaction, guild) => {
        await interaction.defer();
        guild.queue.tracks.splice(0, 5000);
        guild.audioPlayer.stop(true);
        guild.queue.internalCurrentIndex = 0;
        const embed = new builders.EmbedBuilder();
        embed.setDescription("Cleared queue.");
        await interaction.editOriginal({ embeds: [embed.toJSON()] });
    }
};
