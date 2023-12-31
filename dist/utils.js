import fs from 'fs';
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import { Base64 as base64 } from "js-base64";
import { debugLog } from './bot.js';
export function getHighestResUrl(data) {
    const thumbnails = data.video_details.thumbnails;
    let highestX = 0;
    let highestY = 0;
    let currentHighestUrl = "";
    for (const thumbnail of thumbnails) {
        debugLog(`checking thumbnail of width ${thumbnail.width} and height ${thumbnail.height}`);
        if (thumbnail.width > highestX && thumbnail.height > highestY) {
            debugLog(`thumbnail of width ${thumbnail.width} and height ${thumbnail.height} is bigger than previous thumbnail`);
            currentHighestUrl = thumbnail.url;
        }
    }
    return currentHighestUrl;
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
export function encode(array) {
    const arr = JSON.stringify(array);
    return base64.encode(arr);
}
export function decodeStr(str) {
    const decoded = base64.decode(str);
    debugLog(decoded);
    return JSON.parse(decoded);
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
export async function queuedTrackPager(array, callback = () => { return new Promise((resolve) => resolve()); }, resolvers) {
    const pages = [];
    for (let i = 0; i < array.length; i++) {
        await callback(`${array[i].name}`);
        const pagers = await resolvers.getPagers(array[i].tracks[0].url);
        let output;
        for (const pager of pagers) {
            output = await pager.queuedPager(array[i], i);
            if (output) {
                pages.push(output);
                break;
            }
        }
        if (output == undefined) {
            throw new Error(`Could not get pager for ${array[i].name}`);
        }
    }
    return Pager({ pages: pages });
}
export function parseVolumeString(volume) {
    const percentRegex = /[^%]/g;
    let mode = "whole number";
    if (volume.match(/%/g))
        mode = "percent";
    const int = parseFloat(volume.match(percentRegex).join(''));
    if (mode == "percent") {
        var result = int / 100;
    }
    else {
        var result = int;
    }
    return result;
}
export async function trackPager(array, callback = () => { return new Promise((resolve) => resolve()); }, resolvers) {
    const pages = [];
    for (let i = 0; i < array.length; i++) {
        await callback(`paging ${array[i].name}`);
        const pagers = await resolvers.getPagers(array[i].url);
        let output;
        for (const pager of pagers) {
            output = await pager.trackPager(array[i], i);
            if (output) {
                pages.push(output);
                break;
            }
        }
        if (output == undefined) {
            throw new Error(`Could not get pager for ${array[i].name}`);
        }
    }
    return Pager({ pages: pages });
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
};
