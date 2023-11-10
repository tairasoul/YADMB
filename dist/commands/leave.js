import * as builders from "@oceanicjs/builders";
export default {
    name: "leave",
    description: "Leave the current VC.",
    callback: async (interaction, guild) => {
        await interaction.defer();
        if (guild.connection) {
            guild.connection.disconnect();
            guild.connection.destroy();
            guild.voiceChannel = null;
            const embed = new builders.EmbedBuilder();
            embed.setDescription("Disconnected.");
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
        else {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("I am not in a VC.");
            await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
    }
};
