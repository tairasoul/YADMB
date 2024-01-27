import { Guild } from "../client.js";
import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import humanize from "humanize-duration";
import ResolverUtils from "../resolverUtils.js";

export default {
    name: "progress",
    description: "Get progress of current song (if any).",
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverUtils, guild: Guild) => {
        const songTime = guild.queue.currentInfo?.resource?.playbackDuration;
        const progressTime = guild.queue.currentInfo?.songStart;
        const embed = new builders.EmbedBuilder();
        if (guild.queue.tracks[guild.queue.internalCurrentIndex] !== undefined && songTime && progressTime && guild.queue.currentInfo) {
            const remaining = humanize(songTime - progressTime, {round: true});
            const ct = guild.queue.tracks[guild.queue.internalCurrentIndex];
            embed.setTitle(`Progress for ${ct.tracks[ct.trackNumber].name}`);
            embed.addField("Time remaining", remaining);
            embed.addField("Song duration", humanize(progressTime));
            embed.addField("Author", guild.queue.currentInfo.info.channelName || "None found.");
            for (const field of guild.queue.currentInfo.info.fields ?? []) {
                embed.addField(field.name, field.value, field.inline);
            }
            //embed.addField("Likes", guild.queue.currentInfo.info.likes);
            //embed.addField("Views", guild.queue.currentInfo.info.views);
            embed.setImage(guild.queue.currentInfo.info.highestResUrl);
        }
        else {
            embed.setTitle(`No song currently playing or available.`);
        }
        await interaction.createMessage({embeds: [embed.toJSON()]});
    }
}
