import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild, ResolverInformation, loopType } from "../client.js";

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
                    name: "none", value: "none"
                },
                {
                    name: "song", value: "song"
                },
                {
                    name: "playlist", value: "playlist"
                },
                {
                    name: "queue", value: "queue"
                }
            ],
            required: true
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild) => {
        await interaction.defer();
        const choice: loopType = interaction.data.options.getString("type", true);
        const embed = new builders.EmbedBuilder();
        embed.setDescription(loopTypeStrs[choice])
        guild.queue.setLoopType(choice);
        await interaction.editOriginal({embeds: [embed.toJSON()]});
    }
}