import * as oceanic from "oceanic.js";
import { Guild, queuedTrack } from "../client.js";
import * as builders from "@oceanicjs/builders"
// @ts-ignore
import {default as lzw} from "lzwcompress";
import base64 from "base-64";

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
    callback: async (interaction: oceanic.CommandInteraction, guild: Guild) => {
        await interaction.defer()
        const type: "playlist" | "queue" = interaction.data.options.getString("type", true);
        const queue = guild.queue
        switch(type) {
            case "playlist":
                const q = queue.tracks[queue.internalCurrentIndex];
                if (q.type === "song") {
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription("The current track is not a playlist.")
                    return await interaction.editOriginal({embeds: [embed.toJSON()]});
                }
                const clone: queuedTrack = {
                    trackNumber: 0,
                    tracks: q.tracks,
                    type: "playlist",
                    name: q.name
                };
                const c = lzw.pack(clone);
                const encoded = base64.encode(c.toString());
                await interaction.editOriginal({content: "Exported playlist. Save this as a file:", files: [
                    {
                        name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                        contents: new Buffer(encoded)
                    }
                ]});
            case "queue":
                const qClone: queuedTrack[] = [];
                for (const track of queue.tracks) {
                    qClone.push(track)
                }
                for (const clone of qClone) {
                    clone.trackNumber = 0;
                }
                const lzp = lzw.pack(qClone);
                const q_enc = base64.encode(lzp.toString());
                await interaction.editOriginal({content: "Exported queue. Save this as a file:", files: [
                    {
                        name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                        contents: new Buffer(q_enc)
                    }
                ]});
        }
    }
}