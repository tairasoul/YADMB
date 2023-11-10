import * as builders from "@oceanicjs/builders";
import utils from "../utils.js";
import humanize from "humanize-duration";
export default {
    name: "progress",
    description: "Get progress of current song (if any).",
    callback: async (interaction, guild) => {
        const songTime = guild.queue.currentInfo?.resource?.playbackDuration;
        const progressTime = guild.queue.currentInfo?.songStart;
        const embed = new builders.EmbedBuilder();
        if (guild.queue.tracks[guild.queue.internalCurrentIndex] !== undefined && songTime && progressTime && guild.queue.currentInfo) {
            const remaining = humanize(songTime - progressTime, { round: true });
            const ct = guild.queue.tracks[guild.queue.internalCurrentIndex];
            embed.setTitle(`Progress for ${ct.tracks[ct.trackNumber].name}`);
            embed.addField("Time remaining", remaining);
            embed.addField("Song duration", humanize(progressTime));
            embed.addField("Author", guild.queue.currentInfo.info.video_details.channel?.name || "None found.");
            embed.addField("Likes", guild.queue.currentInfo.info.video_details.likes.toString());
            embed.addField("Views", guild.queue.currentInfo.info.video_details.views.toString());
            embed.setImage(utils.getHighestResUrl(guild.queue.currentInfo.info));
        }
        else {
            embed.setTitle(`No song currently playing or available.`);
        }
        await interaction.createMessage({ embeds: [embed.toJSON()] });
    }
};
