import * as builders from "@oceanicjs/builders";
export default {
    name: "pause",
    description: "Pause current track.",
    callback: async (interaction, guild) => {
        const queue = guild.queue;
        if (queue.currentInfo) {
            queue.pause();
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Paused track ${queue.currentInfo.name}`);
            await interaction.createMessage({ embeds: [embed.toJSON()] });
        }
        else {
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`No track to pause. Has the bot joined a voice channel yet?`);
            await interaction.createMessage({ embeds: [embed.toJSON()] });
        }
    }
};
