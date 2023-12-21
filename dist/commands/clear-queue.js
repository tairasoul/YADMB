import * as builders from "@oceanicjs/builders";
export default {
    name: "clear-queue",
    description: "Clear the queue.",
    callback: async (interaction, _resolvers, guild) => {
        await interaction.defer();
        guild.queue.clearQueue();
        const embed = new builders.EmbedBuilder();
        embed.setDescription("Cleared queue.");
        await interaction.editOriginal({ embeds: [embed.toJSON()] });
    }
};
