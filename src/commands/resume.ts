import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild } from "../client.js";
import ResolverUtils from "../resolverUtils.js";

export default {
    name: "resume",
    description: "Resume current track.",
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverUtils, guild: Guild) => {
        const queue = guild.queue;
        if (queue.currentInfo) {
            queue.resume();
            const embed = new builders.EmbedBuilder();
            embed.setDescription(`Resumed track **${queue.currentInfo.name}**`);
            await interaction.createMessage({embeds: [embed.toJSON()]});
        }
        else {
            const embed = new builders.EmbedBuilder()
            embed.setDescription(`No track to resume. Has the bot joined a voice channel yet?`);
            await interaction.createMessage({embeds: [embed.toJSON()]})
        }
    }
}