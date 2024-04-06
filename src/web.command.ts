import { ApplicationCommandBuilder, EmbedBuilder } from "@oceanicjs/builders";
import { Command } from "./client";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const { web_editor_link } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));

const web: Command = {
    data: new ApplicationCommandBuilder(1, "web-ui")
    .setDescription("Get the link to the web ui"),
    async execute(interaction) {
        const embed = new EmbedBuilder();
        embed.setDescription(`Here's the [link for the web ui.](${web_editor_link})`);
        await interaction.createMessage({embeds: [embed.toJSON()]})
    }
}

export default web;