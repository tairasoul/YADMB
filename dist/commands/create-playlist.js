import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Base64 as base64 } from "js-base64";
import rstring from "randomstring";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import utils from "../utils.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${path.join(__dirname, "..")}/enableDebugging`))
    debug = true;
function debugLog(text) {
    if (debug)
        console.log(text);
}
function embedMessage(text) {
    const embed = new builders.EmbedBuilder();
    embed.setDescription(text);
    return embed.toJSON();
}
// util functions
function startsWith(str, strings) {
    for (const string of strings) {
        if (str.startsWith(string))
            return true;
    }
    return false;
}
export default {
    name: "create-playlist",
    description: "Create a custom playlist.",
    options: [
        {
            type: oceanic.ApplicationCommandOptionTypes.STRING,
            required: true,
            name: "playlist-name",
            description: "Name of the playlist."
        }
    ],
    callback: async (interaction, resolvers, guild, client) => {
        await interaction.defer(1 << 6);
        const name = interaction.data.options.getString("playlist-name", true);
        const data = {
            type: "playlist",
            name: name,
            trackNumber: 0,
            tracks: []
        };
        const paged = [];
        let currentTrack = 0;
        await interaction.editOriginal({ embeds: [embedMessage("Creating component ids.")], flags: 1 << 6 });
        // create component ids
        debugLog("creating component ids");
        const backId = rstring.generate();
        const nextId = rstring.generate();
        const addId = rstring.generate();
        const removeId = rstring.generate();
        const moveUpId = rstring.generate();
        const moveBackId = rstring.generate();
        const exportId = rstring.generate();
        const modalId = rstring.generate();
        // create components
        await interaction.editOriginal({ embeds: [embedMessage("Creating components.")], flags: 1 << 6 });
        const back = new builders.Button(oceanic.ButtonStyles.PRIMARY, backId);
        const next = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextId);
        const add = new builders.Button(oceanic.ButtonStyles.PRIMARY, addId);
        const remove = new builders.Button(oceanic.ButtonStyles.PRIMARY, removeId);
        const moveUp = new builders.Button(oceanic.ButtonStyles.PRIMARY, moveUpId);
        const moveBack = new builders.Button(oceanic.ButtonStyles.PRIMARY, moveBackId);
        const exportB = new builders.Button(oceanic.ButtonStyles.PRIMARY, exportId);
        // set labels
        back.setLabel("Previous song");
        next.setLabel("Next song");
        add.setLabel("Add song");
        remove.setLabel("Remove song");
        moveUp.setLabel("Move song forwards");
        moveBack.setLabel("Move song backwards");
        exportB.setLabel("Export playlist (disables buttons)");
        // create component thingy
        const rows = {
            enabled: [
                new builders.ActionRow().addComponents(moveBack, add, remove, moveUp).toJSON(),
                new builders.ActionRow().addComponents(back, exportB, next).toJSON()
            ],
            moveBackDisabled: [
                new builders.ActionRow().addComponents(moveBack.disable(), add, remove, moveUp).toJSON(),
                new builders.ActionRow().addComponents(back, exportB, next).toJSON()
            ],
            moveUpDisabled: [
                new builders.ActionRow().addComponents(moveBack.enable(), add, remove, moveUp.disable()).toJSON(),
                new builders.ActionRow().addComponents(back, exportB, next).toJSON()
            ],
            movesDisabled: [
                new builders.ActionRow().addComponents(moveBack.disable(), add, remove, moveUp.disable()).toJSON(),
                new builders.ActionRow().addComponents(back, exportB, next).toJSON()
            ],
            disabled: [
                new builders.ActionRow().addComponents(moveBack.disable(), add.disable(), remove.disable(), moveUp.disable()).toJSON(),
                new builders.ActionRow().addComponents(back.disable(), exportB.disable(), next.disable()).toJSON()
            ],
        };
        // create callbacks
        const onExport = async (i) => {
            if (i.data.customID !== exportId)
                return;
            /** @ts-ignore */
            await i.editParent({ embeds: [paged[currentTrack].embed.toJSON()], components: rows.disabled, flags: 1 << 6 });
            const encoded = base64.encode(JSON.stringify(data));
            await i.createFollowup({ content: `Exported playlist **${name}**. Save this as a file:`, files: [
                    {
                        name: `${interaction.member.username}.playlist.${name}.export.txt`,
                        contents: new Buffer(encoded)
                    }
                ], flags: 1 << 6 });
            /** @ts-ignore */
            client.off("interactionCreate", onBack);
            /** @ts-ignore */
            client.off("interactionCreate", onNext);
            /** @ts-ignore */
            client.off("interactionCreate", onRemove);
            /** @ts-ignore */
            client.off("interactionCreate", onAdd);
            /** @ts-ignore */
            client.off("interactionCreate", onMoveBack);
            /** @ts-ignore */
            client.off("interactionCreate", onMoveUp);
            /** @ts-ignore */
            client.off("interactionCreate", onExport);
        };
        const onBack = async (i) => {
            if (i.data.customID !== backId)
                return;
            currentTrack -= 1;
            if (currentTrack == -1)
                currentTrack = paged.length - 1;
            const embed = paged[currentTrack].embed;
            const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled);
            /** @ts-ignore */
            await i.editParent({ embeds: [embed.toJSON()], components: components, flags: 1 << 6 });
        };
        const onNext = async (i) => {
            if (i.data.customID !== nextId)
                return;
            currentTrack += 1;
            if (currentTrack == paged.length)
                currentTrack = 0;
            debugLog(paged);
            const embed = paged[currentTrack].embed;
            const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled);
            /** @ts-ignore */
            await i.editParent({ embeds: [embed.toJSON()], components: components, flags: 1 << 6 });
        };
        const onMoveBack = async (i) => {
            if (i.data.customID !== moveBackId)
                return;
            const currentData = {
                paged: paged.splice(currentTrack, 1)[0],
                track: data.tracks.splice(currentTrack, 1)[0]
            };
            debugLog(paged);
            currentData.paged.index -= 1;
            for (const field of currentData.paged.embed.getFields()) {
                if (field.name === "index") {
                    field.value = (currentData.paged.index).toString();
                }
            }
            paged[currentTrack - 1].index += 1;
            for (const field of paged[currentTrack - 1].embed.getFields()) {
                if (field.name === "index") {
                    field.value = (paged[currentTrack - 1].index).toString();
                }
            }
            paged.splice(currentTrack - 1, 0, currentData.paged);
            debugLog(paged);
            data.tracks.splice(currentTrack - 1, 0, currentData.track);
            const embed = paged[currentTrack].embed;
            /** @ts-ignore */
            await i.editParent({ embeds: [embed.toJSON()], components: rows.enabled, flags: 1 << 6 });
            await i.createFollowup({ embeds: [embedMessage(`Moved track **${currentData.track.name}** backwards.`)], flags: 1 << 6 });
        };
        const onMoveUp = async (i) => {
            if (i.data.customID !== moveUpId)
                return;
            const currentData = {
                paged: paged.splice(currentTrack, 1)[0],
                track: data.tracks.splice(currentTrack, 1)[0]
            };
            debugLog(paged);
            currentData.paged.index += 1;
            for (const field of currentData.paged.embed.getFields()) {
                if (field.name === "index") {
                    field.value = (currentData.paged.index).toString();
                }
            }
            paged[currentTrack].index -= 1;
            for (const field of paged[currentTrack].embed.getFields()) {
                if (field.name === "index") {
                    field.value = (paged[currentTrack].index).toString();
                }
            }
            paged.splice(currentTrack + 1, 0, currentData.paged);
            debugLog(paged);
            data.tracks.splice(currentTrack + 1, 0, currentData.track);
            const embed = paged[currentTrack].embed;
            /** @ts-ignore */
            await i.editParent({ embeds: [embed.toJSON()], components: rows.enabled, flags: 1 << 6 });
            await i.createFollowup({ embeds: [embedMessage(`Moved track **${currentData.track.name}** forwards.`)], flags: 1 << 6 });
        };
        const onRemove = async (i) => {
            if (i.data.customID !== removeId)
                return;
            if (paged[currentTrack] == undefined)
                return;
            const splicedData = {
                paged: paged.splice(currentTrack, 1),
                track: data.tracks.splice(currentTrack, 1)
            };
            for (const page of paged) {
                if (page.index > splicedData.paged[0].index) {
                    for (const field of page.embed.getFields()) {
                        if (field.name == "index")
                            field.value = (parseInt(field.value) - 1).toString();
                    }
                }
            }
            if (currentTrack == paged.length)
                currentTrack = paged.length - 1;
            if (data.tracks.length > 0) {
                const components = (currentTrack == 0 ? rows.moveBackDisabled : currentTrack == paged.length - 1 ? rows.moveUpDisabled : rows.enabled);
                /** @ts-ignore */
                await i.editParent({ embeds: [paged[currentTrack].embed.toJSON()], components: components, flags: 1 << 6 });
            }
            else {
                /** @ts-ignore */
                await interaction.editOriginal({ embeds: [embedMessage("No songs yet. Use the components to add some!")], components: rows.movesDisabled, flags: 1 << 6 });
            }
            await i.createFollowup({ embeds: [embedMessage(`Removed track **${splicedData.track[0].name}**`)], flags: 1 << 6 });
        };
        const addCallback = async (int, resolve) => {
            if (int.data.customID !== modalId)
                return;
            if (!int.acknowledged)
                await int.defer(1 << 6);
            const video = int.data.components[0].components[0].value;
            const provider = await resolvers.songResolvers.find(async (resolver) => await resolver.resolve(video))?.resolve(video);
            if (provider == undefined) {
                return int.editOriginal({ embeds: [embedMessage("Invalid song link.")], flags: 1 << 6 });
            }
            const dataResolver = resolvers.songDataResolvers.find((resolver) => resolver.regexMatches.find((resolver) => resolver.test(video)));
            if (dataResolver) {
                const vdata = await dataResolver.resolve(video);
                if (typeof vdata != "string") {
                    const add = {
                        name: vdata.title,
                        url: vdata.url
                    };
                    data.tracks.push(add);
                    // @ts-ignore
                    const pagedd = await utils.pageTrack(add);
                    pagedd.index = paged.length;
                    pagedd.embed.addField("index", pagedd.index.toString(), true);
                    paged.push(pagedd);
                    const embed = new builders.EmbedBuilder();
                    embed.setDescription(`Added **${vdata.title}** to custom playlist.`);
                    await int.editOriginal({ embeds: [embed.toJSON()], flags: 1 << 6 });
                    resolve();
                }
                else {
                    await int.editOriginal({ embeds: [embedMessage(vdata)] });
                }
            }
            else {
                await int.editOriginal({ embeds: [embedMessage(`No resolver found for provider ${provider}.`)] });
            }
        };
        const onAdd = async (i) => {
            if (i.data.customID !== addId)
                return;
            const modalRow = new builders.ActionRow();
            const inputId = rstring.generate();
            const input = new builders.TextInput(oceanic.TextInputStyles.SHORT, "url", inputId);
            input.setLabel("song url");
            input.setRequired(true);
            modalRow.addComponents(input);
            /** @ts-ignore */
            await i.createModal({ components: [modalRow.toJSON()], customID: modalId, title: "Add song to playlist." });
            let callback;
            await new Promise((resolve) => {
                callback = async (inter) => {
                    await addCallback(inter, resolve);
                };
                /** @ts-ignore */
                client.on("interactionCreate", callback);
                setTimeout(() => {
                    /** @ts-ignore */
                    client.off("interactionCreate", async (inter) => {
                        await addCallback(inter, resolve);
                    });
                }, 180000);
            });
            /** @ts-ignore */
            client.off("interactionCreate", callback);
            if (data.tracks.length == 1) {
                /** @ts-ignore */
                await interaction.editOriginal({ embeds: [paged[currentTrack].embed.toJSON()], components: rows.movesDisabled, flags: 1 << 6 });
            }
        };
        /** @ts-ignore */
        await interaction.editOriginal({ embeds: [embedMessage("No songs yet. Use the components to add some!")], components: rows.movesDisabled, flags: 1 << 6 });
        /** @ts-ignore */
        client.on("interactionCreate", onBack);
        /** @ts-ignore */
        client.on("interactionCreate", onNext);
        /** @ts-ignore */
        client.on("interactionCreate", onRemove);
        /** @ts-ignore */
        client.on("interactionCreate", onAdd);
        /** @ts-ignore */
        client.on("interactionCreate", onMoveBack);
        /** @ts-ignore */
        client.on("interactionCreate", onMoveUp);
        /** @ts-ignore */
        client.on("interactionCreate", onExport);
    }
};
