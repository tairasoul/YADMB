import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild, loopType } from "../classes/client.js";

const loopTypeStrs = {
    "none": "No longer looping anything.",
    "song": "Looping the currently playing song.",
    "playlist": "Looping the currently playing playlist (same as song if the current track was added as a song)",
    "queue": "Looping the entire queue."
}

export default {
    name: "loop",
    description: "Loop a specific part of the queue.",
    options: [
        {
            type: 3,
            name: 'type',
            description: "What do you want to loop?",
            choices: [
                {
                    name: "No looping.", value: "none"
                },
                {
                    name: "The current song.", value: "song"
                },
                {
                    name: "The current playlist.", value: "playlist"
                },
                {
                    name: "The entire queue.", value: "queue"
                }
            ],
            required: true
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, info: {
        guild: Guild, 
    }) => {
        await interaction.defer();
        const choice: loopType = interaction.data.options.getString("type", true);
        const embed = new builders.EmbedBuilder();
        embed.setDescription(loopTypeStrs[choice])
        info.guild.queue.setLoopType(choice);
        await interaction.editOriginal({embeds: [embed.toJSON()]});
    }
}