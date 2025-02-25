import * as oceanic from "oceanic.js";
import { Guild } from "../classes/client.js";
import utils from "../utils.js";
import * as builders from "@oceanicjs/builders";
import * as voice from "@discordjs/voice";
import ResolverUtils from "../classes/resolverUtils.js";
import { debugLog } from "../bot.js";
import { Proxy } from "../types/proxyTypes.js";
import ytdl from "@distube/ytdl-core";

export default {
    name: "import",
    description: "Import a exported queue/playlist.",
    options: [
        {
            name: "encoded",
            type: oceanic.ApplicationCommandOptionTypes.ATTACHMENT,
            description: "The encoded queue/playlist.",
            required: true
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils, 
        guild: Guild, 
        cache: Cache,
        proxyInfo: Proxy |  undefined, 
        authenticatedAgent: ytdl.Agent | undefined
    }) => {
        await interaction.defer()
        const queue = info.guild.queue;
        const encoded = interaction.data.options.getAttachment("encoded", true);
        const data = await fetch(encoded.url, {
            method: "GET"
        });
        const encodedData = await data.text();
        const lzd = utils.decodeStr(encodedData);
        debugLog("logging import lz decoded for debug info")
        debugLog(lzd);
        if (lzd?.trackNumber !== undefined) {
            debugLog("found track number")
            queue.tracks.push(lzd);
        }
        else {
            debugLog("no track number, iterating.")
            for (const track of lzd) {
                queue.tracks.push(track);
            }
        }
        const embed = new builders.EmbedBuilder();
        embed.setDescription(`Imported ${lzd.trackNumber !== undefined ? lzd.tracks.length : lzd.length} ${lzd.trackNumber !== undefined ? lzd.tracks.length > 1 ? "songs" : "song" : lzd.length > 1 ? "songs" : "song"} from ${encoded.filename}`);
        await interaction.editOriginal({embeds: [embed.toJSON()]});
        if (info.guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && info.guild.connection) await queue.play(info.resolvers, info.proxyInfo, info.authenticatedAgent);
    }
}