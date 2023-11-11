import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import base64 from "base-64";
// @ts-ignore
import lzw from "lzwcompress";
import { encode } from "../utils.js";
function embedMessage(text) {
    const embed = new builders.EmbedBuilder();
    embed.setDescription(text);
    return embed.toJSON();
}
export default {
    name: "update-playlist",
    description: "Update a playlist to the latest encoding version, if not on it.",
    options: [
        {
            type: oceanic.ApplicationCommandOptionTypes.ATTACHMENT,
            required: true,
            name: "playlist",
            description: "Playlist file."
        }
    ],
    callback: async (interaction) => {
        await interaction.defer(1 << 6);
        const attachment = interaction.data.options.getAttachment("playlist", true);
        // get text of attachment
        const text = await (await fetch(attachment.url)).text();
        // decode
        const data = base64.decode(text);
        let isOld = false;
        try {
            // turn it into LZW unpacked data, if it contains .tracks it's an old version since it successfully parsed with lzw
            let oldDataRaw = data.split(",");
            let oldParse = oldDataRaw.map((val) => parseInt(val));
            var oldData = lzw.unpack(oldParse);
            if (oldData.tracks) {
                isOld = true;
            }
        }
        catch { }
        ;
        if (isOld) {
            // encode it with new method
            // aka JSON.stringify() into base64.encode() cause i forgot you could use JSON.stringify() in the first place
            const newData = encode(oldData);
            await interaction.editOriginal({ content: `Updated playlist **${oldData.name}**. Save this as a file:`, files: [
                    {
                        name: `${interaction.member.username}.playlist.${oldData.name}.export.txt`,
                        contents: new Buffer(newData)
                    }
                ], flags: 1 << 6 });
        }
        else {
            await interaction.editOriginal({ embeds: [embedMessage("Your current playlist is up to date.")] });
        }
    }
};
