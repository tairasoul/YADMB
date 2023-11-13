import * as oceanic from "oceanic.js";
import { Guild, default as MusicClient } from "./client.js";
export type resolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<string | undefined>;
};
export type songData = {
    title: string;
    url: string;
};
export type playlistData = {
    title: string;
    items: songData[];
};
export type dataResolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<songData>;
};
export type playlistResolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<playlistData>;
};
export type command = {
    name: string;
    description: string;
    options: oceanic.ApplicationCommandOptions[];
    callback: (interaction: oceanic.CommandInteraction, guild: Guild, client: MusicClient) => any;
};
export type AddonInfo = {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    resolvers: resolver[];
    private?: boolean;
    type: "songResolver";
} | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    commands: command[];
    private?: boolean;
    type: "command";
} | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    dataResolvers: dataResolver[];
    private?: boolean;
    type: "songDataResolver";
} | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    playlistResolvers: playlistResolver[];
    private?: boolean;
    type: "playlistDataResolver";
};
export default class addonLoader {
    private _client;
    private addons;
    constructor(client: MusicClient);
    readAddons(addonPath: string): Promise<void>;
    loadAddons(): void;
    registerAddons(): void;
}
