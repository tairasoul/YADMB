import * as builders from "@oceanicjs/builders";
import utils from "../utils.js";
export default {
    name: "server-info",
    description: "See info about the server as the bot has it stored.",
    callback: async (interaction, info) => {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(`Info for ${interaction.guild.name}`);
        embed.addField("Current song", info.guild.queue.currentInfo?.name || "None", true);
        embed.addField("Loop type", info.guild.queue.loopType, true);
        embed.addField("Volume", utils.parseVolumeString(info.guild.queue.volume).toString()), true;
        embed.addField("Connected channel", info.guild.voiceChannel?.id ? `<#${info.guild.voiceChannel.id}>` : "Not connected.", true);
        embed.addField("Current index in queue", info.guild.queue.internalCurrentIndex.toString(), true);
        embed.addField("Current index in song/playlist", info.guild.queue.tracks[info.guild.queue.internalCurrentIndex]?.trackNumber.toString() || "No current playlist/song", true);
        embed.addField("Amount of queued tracks", info.guild.queue.tracks.length.toString(), true);
        embed.addField("Amount of tracks in current song/playlist", info.guild.queue.tracks[info.guild.queue.internalCurrentIndex]?.tracks.length.toString() || "No current playlist/song"), true;
        embed.addField("Name of current playlist", info.guild.queue.tracks[info.guild.queue.internalCurrentIndex]?.name || "No current playlist/song", true);
        await interaction.createMessage({ embeds: [embed.toJSON()] });
    }
};
