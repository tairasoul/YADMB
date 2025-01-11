import * as oceanic from "oceanic.js";
import MusicClient from "../client.js";

export default {
    name: "view-addons",
    description: "View the addons this YADMB instance has.",
    options: [],
    callback: async (interaction: oceanic.CommandInteraction, info: {
        client: MusicClient
    }) => {
        await interaction.defer();
        let fileData = "";
        for (const addon of info.client.addons) {
            if (addon.private) continue;
            fileData += `${addon.name} v${addon.version}\n  ${addon.description}\n  Credits: ${addon.credits}${addon.sources ? "\n  Sources:\n  " + addon.sources.join("\n  ") : ""}\n\n`;
        }
        await interaction.editOriginal({files: [
            {
                name: `yadmb.instance.${info.client.user.username}.addons.txt`,
                contents: Buffer.from(fileData)
            }
        ]})
    }
}