import { AudioResource } from "@discordjs/voice";
import * as oceanic from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
export type resolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number;
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into something like "youtube" or something more specific if necessary.
     */
    resolve: (url: string) => Promise<string | undefined>;
};
export type PageData = {
    embed: EmbedBuilder;
    id: string;
    index: number;
    type: "playlist" | "song";
};
export type PagerResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number;
};
export type AudioResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number;
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that turns a song URL into an audio resource from discordjs/voice and into infoData. Returns undefined if it can't.
     */
    resolve: (url: string) => Promise<{
        resource: AudioResource<any>;
        info: infoData;
    } | undefined>;
};
export type songData = {
    /**
     * Title of song.
     */
    title: string;
    /**
     * Url of song.
     */
    url: string;
};
export type playlistData = {
    /**
     * Title of playlist.
     */
    title: string;
    /**
     * Items in playlist.
     */
    items: songData[];
    /**
     * Url of playlist. Used for resolving thumbnails.
     */
    url: string;
};
export type dataResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number;
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into song data. Returns undefined if it can't resolve the URL into data.
     */
    resolve: (url: string) => Promise<songData | string | undefined>;
};
export type playlistResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number;
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into playlist data. Returns undefined if it can't resolve the URL into playlist data.
     */
    resolve: (url: string) => Promise<playlistData | string | undefined>;
};
export type thumbnailResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into a thumnbail URL or undefined (if it can't resolve the url)
     */
    resolve: (url: string) => Promise<string | undefined>;
};
export type command = {
    /**
     * Name of command.
     */
    name: string;
    /**
     * Description of command.
     */
    description: string;
    /**
     * The command options.
     */
    options: oceanic.ApplicationCommandOptions[];
};
export type data_resolvers = {
    thumbnail?: thumbnailResolver[];
    playlist?: playlistResolver[];
    songData?: dataResolver[];
    audio?: AudioResolver[];
    pager?: PagerResolver[];
    provider?: resolver[];
};
export type AddonData = {
    resolvers: data_resolvers;
    commands?: command[];
} | {
    resolvers?: data_resolvers;
    commands: command[];
};
export type AddonInfo = {
    /**
     * The name of your addon.
     */
    name: string;
    /**
     * Description of your addon.
     */
    description: string;
    /**
     * Addon version. Gets formatted as v{version}, no need to prefix the version with v
     */
    version: string;
    /**
     * Where can other people find the source of this addon?
     */
    sources?: string[];
    /**
     * Credits for this addon.
     */
    credits: string;
    /**
     * The data for the addon. Contains the resolvers and commands the addon uses.
     */
    data: AddonData;
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
};
export type infoData = {
    /**
     * The uploader of the song.
     */
    channelName: string;
    /**
     * Various fields for metrics available.
     */
    fields?: oceanic.EmbedField[];
    /**
     * Highest resolution URL for the thumbnail.
     */
    highestResUrl: string;
    /**
     * Duration in miliseconds.
     */
    durationInMs: number;
};
