import { ApplicationCommandBuilder, EmbedBuilder } from "@oceanicjs/builders";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const { web_editor_link } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));
const web = {
    data: new ApplicationCommandBuilder(1, "web-playlist-editor")
        .setDescription("Get the link to the web playlist editor"),
    async execute(interaction) {
        const embed = new EmbedBuilder();
        embed.setDescription(`Here's the [link for the web editor.](${web_editor_link})`);
        await interaction.createMessage({ embeds: [embed.toJSON()] });
    }
};
export default web;
