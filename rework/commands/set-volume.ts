import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild, ResolverInformation } from "../client.js";
import utils from "../utils.js";
import ResolverUtils from "../resolverUtils.js";

function embedMessage(text: string) {
    const embed = new builders.EmbedBuilder();
    embed.setDescription(text);
    return embed.toJSON()
}

export default {
    name: "set-volume",
    description: "Set the volume for the bot within the current guild.",
    options: [
        {
            name: "volume",
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            required: true,
            description: "The volume to set to. Can contain a percent (ex. 50%) or a decimal number (ex. 1.2)."
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverUtils,  guild: Guild) => {
        const volume = interaction.data.options.getString("volume", true);
        const characterRegex = /^[0-9%.]*$/g;
        if (characterRegex.test(volume)) {
            guild.queue.setVolume(volume);
            await interaction.createMessage({embeds: [embedMessage(`Set volume for ${(interaction.guild as oceanic.Guild).id} to ${volume}, parsed: ${utils.parseVolumeString(volume)}\nThis will apply when the next song starts.`)]});
        }
        else {
            await interaction.createMessage({embeds: [embedMessage(`Volume ${volume} contains invalid characters! volume can only contain the characters 0-9, . and %`)]});
        }
    }
}