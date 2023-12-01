import * as oceanic from "oceanic.js";
import MusicClient from "../client.js";

export default {
    name: "view-addons",
    description: "View the addons this YADMB instance has.",
    options: [],
    callback: async (interaction: oceanic.CommandInteraction, __: any, _: any, client: MusicClient) => {
        await interaction.defer();
        let fileData = "";
        for (const addon of client.addons) {
            if (addon.private) continue;
            fileData += `${addon.name} v${addon.version}\n${addon.description}\nCredits: ${addon.credits}${addon.sources ? "\nSources:\n" + addon.sources.join("\n") : ""}\n\n`;
        }
        await interaction.editOriginal({files: [
            {
                name: `yadmb.instance.${client.user.username}.addons.txt`,
                contents: Buffer.from(fileData)
            }
        ]})
    }
}