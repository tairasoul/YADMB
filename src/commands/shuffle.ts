import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild } from "../client.js";
import utils from "../utils.js";
import ResolverUtils from "../resolverUtils.js";
import { debugLog } from "../bot.js";
import { inspect } from "util";

export default {
    name: "shuffle",
    description: "Shuffle the entire queue or the current playlist.",
    options: [
        {
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            required: true,
            name: "type",
            description: "What to shuffle.",
            choices: [
                {
                    name: "playlist",
                    value: "playlist"
                },
                {
                    name: "queue",
                    value: "queue"
                },
                {
                    name: "all",
                    value: "all"
                }
            ]
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils, 
        guild: Guild
    }) => {
        await interaction.defer();
        const shuffleType = interaction.data.options.getString("type", true);
        const queue = info.guild.queue;
        const ct = queue.tracks[queue.internalCurrentIndex];
        if (ct.type === "song" && shuffleType === "playlist") {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("The current track is a song, not a playlist.");
            return await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
        info.guild.audioPlayer.stop(true);
        let track;
        ct.trackNumber = 0;
        if (shuffleType === "playlist") {
            utils.shuffleArray(ct.tracks);
        }
        else if (shuffleType == "queue") {
            track = queue.tracks.splice(queue.internalCurrentIndex, 1)[0];
            utils.shuffleArray(queue.tracks);
        }
        else {
            track = queue.tracks.splice(queue.internalCurrentIndex, 1)[0];
            if (track.type == "playlist") {
                const subTrack = track.tracks.splice(track.trackNumber, 1)[0];
                utils.shuffleArray(track.tracks);
                track.tracks.unshift(subTrack);
            }
            for (const track of queue.tracks) {
                if (track.type == "playlist") {
                    utils.shuffleArray(track.tracks);
                }
            }
            utils.shuffleArray(queue.tracks);
        }
        if (track)
            queue.tracks.unshift(track);
        queue.internalCurrentIndex = 0;
        const embed = new builders.EmbedBuilder();
        embed.setDescription(`Shuffled queue, now playing ${queue.tracks[queue.internalCurrentIndex].tracks[0].name}.`);
        await interaction.editOriginal({embeds: [embed.toJSON()]});
        await queue.play(info.resolvers);
    }
}