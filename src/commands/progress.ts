import { Guild } from "../client.js";
import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import humanize from "humanize-duration";
import ResolverUtils from "../resolverUtils.js";

export default {
    name: "progress",
    description: "Get progress of current song (if any).",
    callback: async (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils, 
        guild: Guild,
    }) => {
        const songTime = info.guild.queue.currentInfo?.resource?.playbackDuration;
        const progressTime = info.guild.queue.currentInfo?.songStart;
        const embed = new builders.EmbedBuilder();
        if (info.guild.queue.tracks[info.guild.queue.internalCurrentIndex] !== undefined && songTime && progressTime && info.guild.queue.currentInfo) {
            const remaining = humanize(songTime - progressTime, {round: true});
            const ct = info.guild.queue.tracks[info.guild.queue.internalCurrentIndex];
            embed.setTitle(`Progress for ${ct.tracks[ct.trackNumber].name}`);
            embed.addField("Time remaining", remaining);
            embed.addField("Song duration", humanize(progressTime));
            embed.addField("Author", info.guild.queue.currentInfo.info.channelName || "None found.");
            for (const field of info.guild.queue.currentInfo.info.fields ?? []) {
                embed.addField(field.name, field.value, field.inline);
            }
            //embed.addField("Likes", guild.queue.currentInfo.info.likes);
            //embed.addField("Views", guild.queue.currentInfo.info.views);
            embed.setImage(info.guild.queue.currentInfo.info.highestResUrl);
        }
        else {
            embed.setTitle(`No song currently playing or available.`);
        }
        await interaction.createMessage({embeds: [embed.toJSON()]});
    }
}
