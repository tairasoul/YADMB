import MusicClient, { Guild, ResolverInformation, queuedTrack } from "../client.js";
import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import rstring from "randomstring";
import utils, { PageHolder } from "../utils.js";
// @ts-ignore
import {default as lzw} from "lzwcompress";
import { Base64 as base64} from "js-base64";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import ResolverUtils from "../resolverUtils.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${path.join(__dirname, "..")}/enableDebugging`)) debug = true;

function debugLog(text: any) {
    if (debug) console.log(text)
}

function embedMessage(text: string) {
    const embed = new builders.EmbedBuilder();
    embed.setDescription(text);
    return embed.toJSON()
}

export default {
    name: "view-queue",
    description: "View a snapshot of the queue.",
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverUtils, guild: Guild, client: MusicClient) => {
        await interaction.defer(1 << 6)
        await interaction.editOriginal({embeds: [embedMessage("Paging queued tracks. Please wait, as the time taken will vary depending on queue length.")], flags: 1 << 6})
        const data: {queued: PageHolder, tracks: PageHolder | null} = {
            queued: await utils.queuedTrackPager(guild.queue.tracks, async (title) => {
                await interaction.editOriginal({embeds: [embedMessage(`Paging track **${title}**`)], flags: 1 << 6})
            }),
            tracks: null
        }
        let isInspecting = false;
        let currentPage = 0;
        let currentInspectPage = 0;
        // make ids
        debugLog("making component ids")
        const nextEmbedId = rstring.generate();
        const prevEmbedId = rstring.generate();
        const inspectId = rstring.generate();
        const playNextId = rstring.generate();
        const nextInspectedId = rstring.generate();
        const prevInspectedId = rstring.generate();
        const exitInspectId = rstring.generate();
        const exportId = rstring.generate();
        const exitId = rstring.generate();
        // setup buttons
        debugLog("creating components")
        const nextEmbed = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextEmbedId);
        const prevEmbed = new builders.Button(oceanic.ButtonStyles.PRIMARY, prevEmbedId);
        const inspect = new builders.Button(oceanic.ButtonStyles.PRIMARY, inspectId);
        const playNext = new builders.Button(oceanic.ButtonStyles.PRIMARY, playNextId);
        const nextInspected = new builders.Button(oceanic.ButtonStyles.PRIMARY, nextInspectedId);
        const prevInspected = new builders.Button(oceanic.ButtonStyles.PRIMARY, prevInspectedId);
        const exitInspect = new builders.Button(oceanic.ButtonStyles.PRIMARY, exitInspectId);
        const exportB = new builders.Button(oceanic.ButtonStyles.PRIMARY, exportId);
        const exit = new builders.Button(oceanic.ButtonStyles.PRIMARY, exitId);
        // setup labels
        debugLog("setting labels")
        nextEmbed.setLabel("Next");
        prevEmbed.setLabel("Previous");
        inspect.setLabel("Inspect");
        playNext.setLabel("Play next");
        nextInspected.setLabel("Next song");
        prevInspected.setLabel("Previous song");
        exitInspect.setLabel("Exit inspect mode");
        exportB.setLabel("Export viewed playlist");
        exit.setLabel("Stop viewing queue")
        // setup action rows
        const actionRows = {
            song: [
                new builders.ActionRow().addComponents(playNext).toJSON(),
                new builders.ActionRow().addComponents(prevEmbed, exit, nextEmbed).toJSON()
            ],
            playlist: [
                new builders.ActionRow().addComponents(inspect, playNext, exportB).toJSON(),
                new builders.ActionRow().addComponents(prevEmbed, exit, nextEmbed).toJSON(),
            ],
            inspected: [
                new builders.ActionRow().addComponents(exitInspect).toJSON(),
                new builders.ActionRow().addComponents(prevInspected, nextInspected).toJSON()
            ],
            disabled: {
                song: [
                    new builders.ActionRow().addComponents(playNext.disable()).toJSON(),
                    new builders.ActionRow().addComponents(prevEmbed.disable(), exit.disable(), nextEmbed.disable()).toJSON()
                ],
                playlist: [
                    new builders.ActionRow().addComponents(inspect.disable(), playNext.disable(), exportB.disable()).toJSON(),
                    new builders.ActionRow().addComponents(prevEmbed.disable(), exit.disable(), nextEmbed.disable()).toJSON()
                ],
                inspected: [
                    new builders.ActionRow().addComponents( exitInspect.disable()).toJSON(),
                    new builders.ActionRow().addComponents(prevInspected.disable(), nextInspected.disable()).toJSON()
                ],
            }
        }

        const onExit = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== exitId) return;
            /** @ts-ignore */
            client.off("interactionCreate", onNext);
            /** @ts-ignore */
            client.off("interactionCreate", onPrev);
            /** @ts-ignore */
            client.off("interactionCreate", onInspect);
            /** @ts-ignore */
            client.off("interactionCreate", onPlayNext);
            /** @ts-ignore */
            client.off("interactionCreate", onExitInspect);
            /** @ts-ignore */
            client.off("interactionCreate", onExport);
            /** @ts-ignore */
            client.off("interactionCreate", onExit);
            /** @ts-ignore */
            await interaction.editOriginal({components: isInspecting ? actionRows.disabled.inspected : data.queued.pages[currentPage].type == "song" ? actionRows.disabled.song : actionRows.disabled.playlist})
            await i.createMessage({content: "Exited view.", flags: 1 << 6})
        }

        const onExport = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== exportId) return;
            await i.defer(1 << 6)
            const q = guild.queue.tracks[currentPage]
            const clone: queuedTrack = {
                trackNumber: 0,
                tracks: q.tracks,
                type: "playlist",
                name: q.name
            };
            const c = lzw.pack(clone);
            const encoded = base64.encode(c.toString());
            await i.editOriginal({content: "Exported playlist. Save this as a file:", files: [
                {
                    name: `${(interaction.member as oceanic.Member).id}.${interaction.guildID as string}.${interaction.createdAt.getTime()}.export.txt`,
                    contents: new Buffer(encoded)
                }
            ], flags: 1 << 6});
        }

        const onInspect = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== inspectId) return;
            currentInspectPage = 0;
            await i.createMessage({embeds: [embedMessage("Paging tracks for playlist.")], flags: 1 << 6});
            data.tracks = await utils.trackPager(guild.queue.tracks[currentPage].tracks, async (title) => {
                await i.editOriginal({embeds: [embedMessage(`Paging track **${title}**`)], flags: 1 << 6})
            });
            isInspecting = true;
            /** @ts-ignore */
            await interaction.editOriginal({content: "", embeds: data.tracks.pages[0].embed.toJSON(true), components: actionRows.inspected, flags: 1 << 6});
        }
        
        const onNext = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== nextEmbedId && i.data.customID !==  nextInspectedId) return;
            if (isInspecting && data.tracks) {
                currentInspectPage += 1;
                if (currentInspectPage === data.tracks.pages.length) currentInspectPage = 0;
                const embed = data.tracks.pages[currentInspectPage].embed;
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: actionRows.inspected, flags: 1 << 6})
            }
            else {
                currentPage += 1;
                if (currentPage === data.queued.pages.length) currentPage = 0;
                const current = data.queued.pages[currentPage];
                /** @ts-ignore */
                await i.editParent({content: "", embeds: current.embed.toJSON(true), components: current.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});
            }
        }

        const onPrev = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== prevEmbedId && i.data.customID !== prevInspectedId) return;
            if (isInspecting && data.tracks) {
                currentInspectPage -= 1;
                const embed = data.tracks.pages[currentInspectPage].embed;
                /** @ts-ignore */
                await i.editParent({embeds: [embed.toJSON()], components: actionRows.inspected, flags: 1 << 6})
            }
            else {
                currentPage -= 1;
                if (currentPage === -1) currentPage = data.queued.pages.length - 1;
                const current = data.queued.pages[currentPage];
                /** @ts-ignore */
                await i.editParent({content: "", embeds: current.embed.toJSON(true), components: current.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});
            }
        }

        const onPlayNext = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== playNextId) return;
            await i.defer()
            const queueIndex = data.queued.pages[currentPage].index;
            const queued = guild.queue.tracks;
            const removed = queued.splice(queueIndex, 1);
            queued.splice(guild.queue.internalCurrentIndex, 0, removed[0]);
            await i.createMessage({embeds: [embedMessage("Playing " + removed[0].name + " next.")], flags: 1 << 6});
        }

        const onExitInspect = async (i: oceanic.ComponentInteraction) => {
            if (i.data.customID !== exitInspectId) return;
            isInspecting = false;
            await i.createMessage({embeds: [embedMessage("Exited inspect mode.")], flags: 1 << 6});
            const current = data.queued.pages[currentPage];
            /** @ts-ignore */
            await interaction.editOriginal({content: "", embeds: current.embed.toJSON(true), components: current.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});
        }
        /** @ts-ignore */
        client.on("interactionCreate", onNext);
        /** @ts-ignore */
        client.on("interactionCreate", onPrev);
        /** @ts-ignore */
        client.on("interactionCreate", onInspect);
        /** @ts-ignore */
        client.on("interactionCreate", onPlayNext);
        /** @ts-ignore */
        client.on("interactionCreate", onExitInspect);
        /** @ts-ignore */
        client.on("interactionCreate", onExport);
        /** @ts-ignore */
        client.on("interactionCreate", onExit)

        const currentpage = data.queued.pages[0];
        /** @ts-ignore */
        await interaction.editOriginal({content: "", embeds: currentpage.embed.toJSON(true), components: currentpage.type === "playlist" ? actionRows.playlist : actionRows.song, flags: 1 << 6});

        setTimeout(async () => {
            /** @ts-ignore */
            client.off("interactionCreate", onNext);
            /** @ts-ignore */
            client.off("interactionCreate", onPrev);
            /** @ts-ignore */
            client.off("interactionCreate", onInspect);
            /** @ts-ignore */
            client.off("interactionCreate", onPlayNext);
            /** @ts-ignore */
            client.off("interactionCreate", onExitInspect);
            /** @ts-ignore */
            client.off("interactionCreate", onRemoveInspected);
            /** @ts-ignore */
            client.off("interactionCreate", onExport);
            /** @ts-ignore */
            client.off("interactionCreate", onExit);
            if (isInspecting) {
                /** @ts-ignore */
                const embed = data.tracks?.pages[currentInspectPage].embed;
                /** @ts-ignore */
                await interaction.editOriginal({embeds: embed?.toJSON(true), components: actionRows.disabled.inspected, flags: 1 << 6});
            }
            else {
                const current = data.queued.pages[currentPage]
                const embed = current.embed;
                /** @ts-ignore */
                await interaction.editOriginal({embeds: embed?.toJSON(true), components: current.type === "playlist" ? actionRows.disabled.playlist : actionRows.disabled.song, flags: 1 << 6});
            }
        }, 720000)
    }
}