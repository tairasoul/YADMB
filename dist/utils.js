import fs from 'fs';
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import path from 'path';
import { fileURLToPath } from 'url';
/** @ts-ignore */
import lzw from "lzwcompress";
import base64 from "base-64";
import playdl from "play-dl";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`))
    debug = true;
function debugLog(text) {
    if (debug)
        console.log(text);
}
export function SelectMenu(options, customId) {
    const actionRow = new builders.ActionRow();
    actionRow.type = oceanic.ComponentTypes.ACTION_ROW;
    const selectMenu = new builders.SelectMenu(oceanic.ComponentTypes.STRING_SELECT, customId);
    const addedsongs = [];
    selectMenu.setPlaceholder('Nothing selected');
    for (const option in options) {
        if (!addedsongs.includes(options[option].name) && options[option].name != '') {
            addedsongs.push(options[option].name);
            const name = options[option].name;
            const value = options[option].value || name;
            const selectoptions = { label: name, value: value, default: false };
            selectMenu.addOptions(selectoptions);
        }
    }
    actionRow.addComponents(selectMenu);
    return actionRow;
}
export function mkdsf(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}
/* taken from StackOverflow: https://stackoverflow.com/a/12646864/21098495 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
export function ComponentCallback(id, interaction, callback, client, timeoutOptions) {
    client.on('interactionCreate', async (i) => {
        /** @ts-ignore */
        if (i?.customId === undefined || i?.customId != id)
            return;
        /** @ts-ignore */
        await callback(i);
    });
    if (timeoutOptions && timeoutOptions.ms) {
        setTimeout(async () => {
            client.removeListener('interactionCreate', async (i) => {
                /** @ts-ignore */
                if (i?.customId === undefined || i?.customId != id)
                    return;
                /** @ts-ignore */
                await callback(i);
            });
            await timeoutOptions.callback(interaction);
        }, timeoutOptions.ms);
    }
}
// listen  for interactions from a specific guild, user and custom id
export function LFGIC(client, guildid, userid, customid, callback) {
    return client.on("interactionCreate", async (i) => {
        if (i.guildID != guildid)
            return;
        if (i.user.id != userid)
            return;
        /** @ts-ignore */
        if (i.data.customID != customid)
            return;
        /** @ts-ignore */
        await callback(i);
    });
}
export function encodeArray(array) {
    const arr = lzw.pack(array).toString();
    return base64.encode(arr);
}
export function decodeStr(str) {
    const decoded = base64.decode(str);
    const split = decoded.split(",");
    const lzwArray = [];
    for (const string of split) {
        lzwArray.push(parseInt(string));
    }
    return lzw.unpack(lzwArray);
}
export class Page {
    iembed;
    idStr;
    index;
    type;
    constructor(embeds, id, index, type) {
        this.iembed = embeds;
        this.idStr = id;
        this.index = index;
        this.type = type;
    }
    get embed() {
        return this.iembed;
    }
    get id() {
        return this.idStr;
    }
}
export class PageHolder {
    pages;
    page = 0;
    constructor(pages) {
        this.pages = pages;
    }
    next() {
        this.page += 1;
        if (this.page === this.pages.length)
            this.page = 0;
    }
    back() {
        this.page -= 1;
        if (this.page === -1)
            this.page = this.pages.length - 1;
    }
    get currentPageNum() {
        return this.page;
    }
    get currentPage() {
        return this.pages[this.page];
    }
}
export function Pager(pages) {
    const PageClasses = [];
    for (const page of pages.pages) {
        PageClasses.push(new Page(page.embed, page.id, page.index, page.type));
    }
    return new PageHolder(PageClasses);
}
export async function queuedTrackPager(array, callback = () => { return new Promise((resolve) => resolve()); }) {
    const pages = [];
    for (let i = 0; i < array.length; i++) {
        const queued = array[i];
        await callback(queued.name);
        debugLog(`paging ${queued.name}`);
        debugLog(queued);
        const embed = new builders.EmbedBuilder();
        embed.setTitle(queued.name);
        embed.addField("index", i.toString(), true);
        embed.addField("type", queued.type, true);
        embed.addField("songs", queued.tracks.length.toString(), true);
        debugLog(queued.tracks[0].url);
        /** @ts-ignore */
        embed.setImage((await playdl.video_basic_info(queued.tracks[0].url)).video_details.thumbnails.find((val) => val.url.includes("maxresdefault")).url);
        pages.push({
            embed: embed,
            id: queued.name,
            index: i,
            type: queued.type
        });
    }
    return Pager({ pages: pages });
}
export async function trackPager(array, callback = () => { return new Promise((resolve) => resolve()); }) {
    const pages = [];
    for (let i = 0; i < array.length; i++) {
        const queued = array[i];
        await callback(queued.name);
        debugLog(`paging ${queued.name}`);
        debugLog(queued);
        const embed = new builders.EmbedBuilder();
        embed.setTitle(queued.name);
        embed.addField("index", i.toString(), true);
        /** @ts-ignore */
        embed.setImage((await playdl.video_basic_info(queued.url)).video_details.thumbnails.find((val) => val.url.includes("maxresdefault")).url);
        pages.push({
            embed: embed,
            id: queued.name,
            index: i,
            type: "inspectedSong"
        });
    }
    return Pager({ pages: pages });
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
    trackPager
};
