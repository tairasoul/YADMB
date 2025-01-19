import fs from 'fs';
import * as oceanic from 'oceanic.js';
import { Client } from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import { Base64 as base64 } from "js-base64";
import { queuedTrack, track } from './classes/client.js';
import { debugLog } from './bot.js';
import ResolverUtils from './classes/resolverUtils.js';
import { PageData } from './types/addonTypes.js';
import Cache from './classes/cache.js';
import ytdl from '@distube/ytdl-core';

export function getHighestResUrl(data: ytdl.videoInfo) {
    const thumbnails = data.videoDetails.thumbnails;
    let highestX = 0;
    let highestY = 0;
    let currentHighestUrl = "";
    for (const thumbnail of thumbnails) {
        debugLog(`checking thumbnail of width ${thumbnail.width} and height ${thumbnail.height}`);
        if (thumbnail.width > highestX && thumbnail.height > highestY) {
            debugLog(`thumbnail of width ${thumbnail.width} and height ${thumbnail.height} is bigger than previous thumbnail`)
            currentHighestUrl = thumbnail.url;
        }
    }
    return currentHighestUrl
}

export function SelectMenu(options: Array<{name: string, value?: string}>, customId: string) {
    const actionRow = new builders.ActionRow()
    actionRow.type = oceanic.ComponentTypes.ACTION_ROW
    const selectMenu = new builders.SelectMenu(oceanic.ComponentTypes.STRING_SELECT, customId)
    const addedsongs: string[] = []
    selectMenu.setPlaceholder('Nothing selected')
    for (const option in options) {
        if (!addedsongs.includes(options[option].name) && options[option].name != '') {
            addedsongs.push(options[option].name)
            const name = options[option].name;
            const value = options[option].value || name
            const selectoptions: oceanic.SelectOption = {label: name, value: value, default: false}
            selectMenu.addOptions(selectoptions)
        }
    }
    actionRow.addComponents(selectMenu)
    return actionRow
}

export function mkdsf (path: fs.PathLike) {
    if (!fs.existsSync(path)) fs.mkdirSync(path)
}

/* taken from StackOverflow: https://stackoverflow.com/a/12646864/21098495 */
export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function ComponentCallback(id: string, interaction: oceanic.CommandInteraction, callback: (i: oceanic.CommandInteraction) => Promise<void>, client: Client, timeoutOptions: {ms: number, callback: (interaction: oceanic.CommandInteraction) => Promise<void>}) {
    const func = async (i: oceanic.AnyInteractionGateway) => {
        /** @ts-ignore */
        if (i?.customId === undefined || i?.customId != id) return
        /** @ts-ignore */
        await callback(i)
    }
    client.on('interactionCreate', func)
    if (timeoutOptions && timeoutOptions.ms) {
        setTimeout(async () => {
            client.removeListener('interactionCreate', func)
            await timeoutOptions.callback(interaction)
        }, timeoutOptions.ms)
    }
}

// listen  for interactions from a specific guild, user and custom id
export function LFGIC(client: Client, guildid: string, userid: string, customid: string, callback: (i: oceanic.CommandInteraction) => Promise<void>) {
    return client.on("interactionCreate", async i => {
        if (i.guildID != guildid) return;
        if (i.user.id != userid) return;
        /** @ts-ignore */
        if (i.data.customID != customid) return;
        /** @ts-ignore */
        await callback(i);
    });
}

export function encode(array: any) {
    const arr = JSON.stringify(array);
    return base64.encode(arr);
}

export function decodeStr(str: string) {
    const decoded = base64.decode(str);
    debugLog("logging decoded base64")
    debugLog(decoded);
    return JSON.parse(decoded);
}

export class Page {
    private iembed: builders.EmbedBuilder;
    private idStr: string;
    index: number;
    type: "playlist" | "song" | "inspectedSong"
    constructor(embeds: builders.EmbedBuilder, id: string, index: number, type: "playlist" | "song" | "inspectedSong") {
        this.iembed = embeds;
        this.idStr = id;
        this.index = index;
        this.type = type
    }

    get embed() {
        return this.iembed;
    }

    get id() {
        return this.idStr;
    }
}

export class PageHolder {
    public pages: Page[];
    private page = 0;
    constructor(pages: Page[]) {
        this.pages = pages;
    }

    next() {
        this.page += 1;
        if (this.page === this.pages.length) this.page = 0;
    }

    back() {
        this.page -= 1;
        if (this.page === -1) this.page = this.pages.length - 1;
    }

    get currentPageNum() {
        return this.page;
    }

    get currentPage() {
        return this.pages[this.page];
    }
}

export interface PageHolderData {
    pages: PageData[]
}

export function Pager(pages: PageHolderData) {
    const PageClasses: Page[] = [];
    for (const page of pages.pages) {
        PageClasses.push(new Page(page.embed, page.id, page.index, page.type));
    }
    return new PageHolder(PageClasses);
}

export async function queuedTrackPager(array: queuedTrack[], callback: (title: string) => Promise<void> = () => {return new Promise((resolve) => resolve())}, resolvers: ResolverUtils, cache: Cache, forceInvalidation: boolean = false) {
    const pages: PageData[] = []
    for (let i = 0; i < array.length; i++) {
        await callback(`${array[i].name}`);
        const pagers = await resolvers.getPagers(array[i].tracks[0].url);
        let output;
        for (const pager of pagers) {
            output = await pager.queuedPager(array[i], i, cache, forceInvalidation);
            if (output) {
                pages.push(output);
                break;
            }
        }
        if (output == undefined) {
            throw new Error(`Could not get pager for ${array[i].name}`);
        }
    }
    return Pager({pages: pages})
}

export type volumeMode = "percent" | "whole number";

export function parseVolumeString(volume: string) {
    const percentRegex = /[^%]/g;
    let mode: volumeMode = "whole number";
    if (volume.match(/%/g)) mode = "percent";
    const int: number = parseFloat((volume.match(percentRegex) as string[]).join(''));
    if (mode == "percent") {
        var result: number = int / 100;
    }
    else {
        var result: number = int;
    }
    return result;
}

export async function trackPager(array: track[], callback: (title: string) => Promise<void> = () => {return new Promise((resolve) => resolve())}, resolvers: ResolverUtils, cache: Cache, forceInvalidation: boolean) {
    const pages: PageData[] = []
    for (let i = 0; i < array.length; i++) {
        await callback(`${array[i].name}`);
        const pagers = await resolvers.getPagers(array[i].url);
        let output;
        for (const pager of pagers) {
            output = await pager.trackPager(array[i], i, cache, forceInvalidation);
            if (output) {
                pages.push(output);
                break;
            }
        }
        if (output == undefined) {
            throw new Error(`Could not get pager for ${array[i].name}`);    
        }
    }
    return pages;
}

export default {
    SelectMenu,
    mkdsf,
    shuffleArray,
    ComponentCallback,
    LFGIC,
    encode,
    decodeStr,
    Pager,
    queuedTrackPager,
    trackPager,
    getHighestResUrl,
    parseVolumeString
}