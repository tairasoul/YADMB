import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import utils from "../utils.js";
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
    callback: async (interaction, info) => {
        await interaction.defer();
        const shuffleType = interaction.data.options.getString("type", true);
        const queue = info.guild.queue;
        const ct = queue.tracks[queue.internalCurrentIndex];
        if (ct.type === "song" && shuffleType === "playlist") {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("The current track is a song, not a playlist.");
            return await interaction.editOriginal({ embeds: [embed.toJSON()] });
        }
        info.guild.audioPlayer.stop(true);
        queue.internalCurrentIndex = 0;
        ct.trackNumber = 0;
        if (shuffleType === "playlist") {
            utils.shuffleArray(ct.tracks);
        }
        else if (shuffleType == "queue") {
            utils.shuffleArray(queue.tracks);
        }
        else {
            for (const track of queue.tracks) {
                if (track.type == "playlist") {
                    utils.shuffleArray(track.tracks);
                }
            }
            utils.shuffleArray(queue.tracks);
        }
        const embed = new builders.EmbedBuilder();
        embed.setDescription(`Shuffled queue, now playing ${queue.tracks[queue.internalCurrentIndex].tracks[0].name}.`);
        await interaction.editOriginal({ embeds: [embed.toJSON()] });
        await queue.play(info.resolvers);
    }
};
