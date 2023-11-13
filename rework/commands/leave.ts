import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild, ResolverInformation } from "../client.js";

export default {
    name: "leave",
    description: "Leave the current VC.",
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild) => {
        await interaction.defer();
        if (guild.connection) {
            guild.connection.disconnect();
            guild.connection = null;
            guild.voiceChannel = null;
            const embed = new builders.EmbedBuilder();
            embed.setDescription("Disconnected.");
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
        else {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("I am not in a VC.");
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
    }
}