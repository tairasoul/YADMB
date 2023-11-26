import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild, ResolverInformation } from "../client.js";
import utils from "../utils.js";
import ResolverUtils from "../resolverUtils.js";

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
                }
            ]
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, resolvers: ResolverUtils, guild: Guild) => {
        await interaction.defer();
        const shuffleType = interaction.data.options.getString("type", true);
        const queue = guild.queue;
        const ct = queue.tracks[queue.internalCurrentIndex];
        if (ct.type === "song" && shuffleType === "playlist") {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("The current track is a song, not a playlist.");
            return await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
        guild.audioPlayer.stop(true);
        queue.internalCurrentIndex = 0;
        ct.trackNumber = 0;
        if (shuffleType === "playlist") {
            utils.shuffleArray(ct.tracks);
        }
        else {
            utils.shuffleArray(queue.tracks);
        }
        const embed = new builders.EmbedBuilder();
        embed.setDescription(`Shuffled queue, now playing ${queue.tracks[queue.internalCurrentIndex].tracks[0].name}.`);
        await interaction.editOriginal({embeds: [embed.toJSON()]});
        await queue.play(resolvers);
    }
}