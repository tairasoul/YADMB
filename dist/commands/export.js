import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Base64 as base64 } from "js-base64";
export default {
    name: "export",
    description: "Export the current queue/playlist as a single string.",
    options: [
        {
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            required: true,
            name: "type",
            description: "What to export.",
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
    callback: async (interaction, _resolvers, guild) => {
        await interaction.defer();
        const type = interaction.data.options.getString("type", true);
        const queue = guild.queue;
        switch (type) {
            case "playlist":
                const q = queue.tracks[queue.internalCurrentIndex];
                if (q.type === "song") {
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription("The current track is not a playlist.");
                    return await interaction.editOriginal({ embeds: [embed.toJSON()] });
                }
                const clone = {
                    trackNumber: 0,
                    tracks: q.tracks,
                    type: "playlist",
                    name: q.name
                };
                const c = JSON.stringify(clone);
                const encoded = base64.encode(c);
                await interaction.editOriginal({ content: "Exported playlist. Save this as a file:", files: [
                        {
                            name: `${interaction.member.id}.${interaction.guildID}.${interaction.createdAt.getTime()}.export.txt`,
                            contents: Buffer.from(encoded)
                        }
                    ] });
            case "queue":
                const qClone = [];
                for (const track of queue.tracks) {
                    qClone.push(track);
                }
                for (const clone of qClone) {
                    clone.trackNumber = 0;
                }
                const lzp = JSON.stringify(qClone);
                const q_enc = base64.encode(lzp);
                await interaction.editOriginal({ content: "Exported queue. Save this as a file:", files: [
                        {
                            name: `${interaction.member.id}.${interaction.guildID}.${interaction.createdAt.getTime()}.export.txt`,
                            contents: Buffer.from(q_enc)
                        }
                    ] });
        }
    }
};
