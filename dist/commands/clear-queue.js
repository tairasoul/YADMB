import * as builders from "@oceanicjs/builders";
export default {
    name: "clear-queue",
    description: "Clear the queue.",
    callback: async (interaction, info) => {
        await interaction.defer();
        info.guild.queue.clearQueue();
        const embed = new builders.EmbedBuilder();
        embed.setDescription("Cleared queue.");
        await interaction.editOriginal({ embeds: [embed.toJSON()] });
    }
};
