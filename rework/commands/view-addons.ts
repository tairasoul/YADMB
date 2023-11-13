import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import MusicClient from "../client.js";
import utils from "../utils.js";

export default {
    name: "view-addons",
    description: "View the addons this YADMB instance has.",
    options: [],
    callback: async (interaction: oceanic.CommandInteraction, __: any, _: any, client: MusicClient) => {
        await interaction.defer();
        let fileData = "";
        for (const addon of client.addons) {
            if (addon.private == true) continue;
            const string = `${addon.name} ${addon.version}\n${addon.description}\nCredits: ${addon.credits}${addon.sources ? "\nSources:\n" + addon.sources.join("\n") : ""}\n\n`;
            fileData += string;
        }
        await interaction.editOriginal({files: [
            {
                name: "yadmb.instance.addons.txt",
                contents: new Buffer(fileData)
            }
        ]})
    }
}