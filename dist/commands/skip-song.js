import * as builders from "@oceanicjs/builders";
export default {
    name: "skip-song",
    description: "Skip the current song.",
    callback: async (interaction, info) => {
        const queue = info.guild.queue;
        const embed = new builders.EmbedBuilder();
        if (queue.currentInfo) {
            embed.setDescription(`Skipped song ${queue.currentInfo.name}.`);
            await queue.skip();
        }
        else {
            embed.setDescription(`No song to skip.`);
        }
        await interaction.createMessage({ embeds: [embed.toJSON()] });
    }
};
