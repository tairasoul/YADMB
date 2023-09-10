import fs from 'fs';
import * as oceanic from 'oceanic.js';
import { Client } from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import path from 'path';
import { fileURLToPath } from 'url';
/** @ts-ignore */
import lzw from "lzwcompress";
import base64 from "base-64";
import playdl, { InfoData } from "play-dl";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`)) debug = true;
function debugLog(text: any) {
    if (debug) console.log(text)
}

export function getHighestResUrl(data: InfoData) {
    const thumbnails = data.video_details.thumbnails;
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
    client.on('interactionCreate', async i => {
        /** @ts-ignore */
        if (i?.customId === undefined || i?.customId != id) return
        /** @ts-ignore */
        await callback(i)
    })
    if (timeoutOptions && timeoutOptions.ms) {
        setTimeout(async () => {
            client.removeListener('interactionCreate', async i => {
                /** @ts-ignore */
                if (i?.customId === undefined || i?.customId != id) return
                /** @ts-ignore */
                await callback(i)
            })
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

export function encodeArray(array: any[]) {
    const arr = lzw.pack(array).toString();
    return base64.encode(arr);
}

export function decodeStr(str: string) {
    const decoded = base64.decode(str);
    debugLog(decoded);
    const split = decoded.split(",");
    debugLog(split);
    const lzwArray = [];
    for (const string of split) {
        lzwArray.push(parseInt(string));
    }
    debugLog(lzwArray)
    return lzw.unpack(lzwArray);
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

export interface PageData {
    embed: builders.EmbedBuilder;
    id: string;
    index: number;
    type: "playlist" | "song" | "inspectedSong";
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

interface track {
    name: string;
    url: string;
}

interface queuedTrack {
    type: "playlist" | "song" | "inspectedSong";
    tracks: track[];
    trackNumber: number;
    name: string;
}

export async function queuedTrackPager(array: queuedTrack[], callback: (title: string) => Promise<void> = () => {return new Promise((resolve) => resolve())}) {
    const pages: PageData[] = []
    for (let i = 0; i < array.length; i++) {
        const queued = array[i];
        await callback(queued.name)
        debugLog(`paging ${queued.name}`)
        debugLog(queued)
        const embed = new builders.EmbedBuilder();
        embed.setTitle(queued.name);
        embed.addField("index", i.toString(), true)
        embed.addField("type", queued.type, true)
        embed.addField("songs", queued.tracks.length.toString(), true)
        debugLog(queued.tracks[0].url);
        const info = await playdl.video_basic_info(queued.tracks[0].url)
        embed.setImage(getHighestResUrl(info));
        pages.push(
            {
                embed: embed,
                id: queued.name,
                index: i,
                type: queued.type
            }
        )
    }
    return Pager({pages: pages})
}

export async function trackPager(array: track[], callback: (title: string) => Promise<void> = () => {return new Promise((resolve) => resolve())}) {
    const pages: PageData[] = []
    for (let i = 0; i < array.length; i ++) {
        const queued = array[i];
        await callback(queued.name)
        debugLog(`paging ${queued.name}`)
        debugLog(queued)
        const embed = new builders.EmbedBuilder();
        embed.setTitle(queued.name);
        embed.addField("index", i.toString(), true)
        const info = await playdl.video_basic_info(queued.url)
        debugLog(info.video_details.thumbnails)
        embed.setImage(getHighestResUrl(info));
        pages.push(
            {
                embed: embed,
                id: queued.name,
                index: i,
                type: "inspectedSong"
            }
        )
        
    }
    return Pager({pages: pages});
}

export async function pageTrack(track: track) {
    debugLog(`paging ${track.name}`)
    debugLog(track)
    const embed = new builders.EmbedBuilder();
    embed.setTitle(track.name);
    const info = await playdl.video_basic_info(track.url)
    debugLog(info.video_details.thumbnails)
    embed.setImage(getHighestResUrl(info));
    return {
            embed: embed,
            id: track.name,
            type: "inspectedSong"
        }
}

export default {
    SelectMenu,
    mkdsf,
    shuffleArray,
    ComponentCallback,
    LFGIC,
    encodeArray,
    decodeStr,
    Pager,
    queuedTrackPager,
    trackPager,
    getHighestResUrl,
    pageTrack
}
