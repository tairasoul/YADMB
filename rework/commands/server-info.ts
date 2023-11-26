import { Guild, ResolverInformation } from "../client.js";
import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import utils from "../utils.js"
import ResolverUtils from "../resolverUtils.js";

export default {
    name: "server-info",
    description: "See info about the server as the bot has it stored.",
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverUtils, guild: Guild) => {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(`Info for ${(interaction.guild as oceanic.Guild).name}`);
        embed.addField("Current song", guild.queue.currentInfo?.name || "None", true);
        embed.addField("Loop type", guild.queue.loopType, true);
        embed.addField("Volume", utils.parseVolumeString(guild.queue.volume).toString()), true;
        embed.addField("Connected channel", guild.voiceChannel?.id ? `<#${guild.voiceChannel.id}>` : "Not connected.", true);
        embed.addField("Current index in queue", guild.queue.internalCurrentIndex.toString(), true);
        embed.addField("Current index in song/playlist", guild.queue.tracks[guild.queue.internalCurrentIndex]?.trackNumber.toString() || "No current playlist/song", true);
        embed.addField("Amount of queued tracks", guild.queue.tracks.length.toString(), true);
        embed.addField("Amount of tracks in current song/playlist", guild.queue.tracks[guild.queue.internalCurrentIndex]?.tracks.length.toString() || "No current playlist/song"), true;
        embed.addField("Name of current playlist", guild.queue.tracks[guild.queue.internalCurrentIndex]?.name || "No current playlist/song", true);
        await interaction.createMessage({embeds: [embed.toJSON()]});
    }
}