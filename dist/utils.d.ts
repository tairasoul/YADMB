import fs from 'fs';
import * as oceanic from 'oceanic.js';
import { Client } from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import { queuedTrack, track } from './classes/client.js';
import ResolverUtils from './classes/resolverUtils.js';
import { PageData } from './types/addonTypes.js';
import Cache from './classes/cache.js';
import ytdl from '@distube/ytdl-core';
import { Proxy } from './types/proxyTypes.js';
export declare function getHighestResUrl(data: ytdl.videoInfo): string;
export declare function SelectMenu(options: Array<{
    name: string;
    value?: string;
}>, customId: string): builders.ActionRow;
export declare function mkdsf(path: fs.PathLike): void;
export declare function shuffleArray(array: any[]): void;
export declare function ComponentCallback(id: string, interaction: oceanic.CommandInteraction, callback: (i: oceanic.CommandInteraction) => Promise<void>, client: Client, timeoutOptions: {
    ms: number;
    callback: (interaction: oceanic.CommandInteraction) => Promise<void>;
}): void;
export declare function LFGIC(client: Client, guildid: string, userid: string, customid: string, callback: (i: oceanic.CommandInteraction) => Promise<void>): oceanic.Client<oceanic.ClientEvents>;
export declare function encode(array: any): string;
export declare function decodeStr(str: string): any;
export declare class Page {
    private iembed;
    private idStr;
    index: number;
    type: "playlist" | "song" | "inspectedSong";
    constructor(embeds: builders.EmbedBuilder, id: string, index: number, type: "playlist" | "song" | "inspectedSong");
    get embed(): builders.EmbedBuilder;
    get id(): string;
}
export declare class PageHolder {
    pages: Page[];
    private page;
    constructor(pages: Page[]);
    next(): void;
    back(): void;
    get currentPageNum(): number;
    get currentPage(): Page;
}
export interface PageHolderData {
    pages: PageData[];
}
export declare function Pager(pages: PageHolderData): PageHolder;
export declare function queuedTrackPager(array: queuedTrack[], proxyInfo: Proxy | undefined, callback: ((title: string) => Promise<void>) | undefined, resolvers: ResolverUtils, cache: Cache, forceInvalidation?: boolean): Promise<PageHolder>;
export type volumeMode = "percent" | "whole number";
export declare function parseVolumeString(volume: string): number;
export declare function trackPager(array: track[], proxyInfo: Proxy | undefined, callback: ((title: string) => Promise<void>) | undefined, resolvers: ResolverUtils, cache: Cache, forceInvalidation: boolean): Promise<PageData[]>;
declare const _default: {
    SelectMenu: typeof SelectMenu;
    mkdsf: typeof mkdsf;
    shuffleArray: typeof shuffleArray;
    ComponentCallback: typeof ComponentCallback;
    LFGIC: typeof LFGIC;
    encode: typeof encode;
    decodeStr: typeof decodeStr;
    Pager: typeof Pager;
    queuedTrackPager: typeof queuedTrackPager;
    trackPager: typeof trackPager;
    getHighestResUrl: typeof getHighestResUrl;
    parseVolumeString: typeof parseVolumeString;
};
export default _default;
