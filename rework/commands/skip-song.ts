import { Guild, ResolverInformation } from "../client.js";
import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";

export default {
    name: "skip-song",
    description: "Skip the current song.",
    callback: async (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild) => {
        const queue = guild.queue;
        const embed = new builders.EmbedBuilder();
        if (queue.currentInfo) {
            embed.setDescription(`Skipped song ${queue.currentInfo.name}.`);
            await queue.skip();
            await queue.play(resolvers);
        }
        else {
            embed.setDescription(`No song to skip.`);
        }
        await interaction.createMessage({embeds: [embed.toJSON()]})
    }
}