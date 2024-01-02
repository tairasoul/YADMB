import { AudioResource } from "@discordjs/voice";
import MusicClient, { Guild, ResolverInformation, queuedTrack } from "./client";
import * as oceanic from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { track } from "./client";

export type resolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into something like "youtube" or something more specific if necessary.
     */
    resolve: (url: string) => Promise<string | undefined>;
}

export type PageData = {
    embed: EmbedBuilder,
    id: string,
    index: number,
    type: "playlist" | "song"
}

export type PagerResolver = {
    
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Pager for a queued item.
     */
    queuedPager: (track: queuedTrack, index: number) => Promise<PageData>;
    /**
     * Pager for a track within a playlist.
     */
    trackPager: (track: track, index: number) => Promise<PageData>;
}

export type AudioResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that turns a song URL into an audio resource from discordjs/voice and into infoData. Returns undefined if it can't.
     */
    resolve: (url: string) => Promise<{resource: AudioResource<any>, info: infoData} | undefined>;
}

export type songData = {
    /**
     * Title of song.
     */
    title: string;
    /**
     * Url of song.
     */
    url: string;
}

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
}

export type dataResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into song data. Returns undefined if it can't resolve the URL into data.
     */
    resolve: (url: string) => Promise<songData | string | undefined>;
}

export type playlistResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * Resolver priority. The lower the number, the lower the priority. If your resolver has the highest priority, it will be attempted first.
     * Please do not set the priority to an absurdly high number, and make it easily configurable by the bot host.
     */
    priority: number
    /**
     * Can this resolver be used for this link?
     */
    available: (url: string) => Promise<boolean>;
    /**
     * Function that resolves the URL into playlist data. Returns undefined if it can't resolve the URL into playlist data.
     */
    resolve: (url: string) => Promise<playlistData | string | undefined>;
}

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
}

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
    /**
     * Callback for this command.
     */
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => any;
}

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
     * Song resolvers.
     */
    resolvers: resolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * A provider resolver.
     */
    type: "songResolver";
} | {
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
     * Commands this addon adds.
     */
    commands: command[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that adds its own commands.
     */
    type: "command";
} | {
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
     * List of song data resolvers.
     */
    dataResolvers: dataResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves song data into something usable.
     */
    type: "songDataResolver";
} | {
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
     * List of playlist resolvers.
     */
    playlistResolvers: playlistResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves playlists into usable data.
     */
    type: "playlistDataResolver";
} | {
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
     * List of playlist resolvers.
     */
    resourceResolvers: AudioResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves a song URL into an Audio Resource
     */
    type: "audioResourceResolver";
} | {
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
     * List of thumbnail resolvers.
     */
    thumbnailResolvers: thumbnailResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves a song URL into a thumbnail URL.
     */
    type: "songThumbnailResolver";
} | {
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
     * List of thumbnail resolvers.
     */
    thumbnailResolvers: thumbnailResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves a song URL into a thumbnail URL.
     */
    type: "playlistThumbnailResolver";
} | {
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
     * List of thumbnail resolvers.
     */
    pagers: PagerResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves a URL into page data.
     */
    type: "pagerAddon";
}

export type infoData = {
    /**
     * The uploader of the song.
     */
    channelName: string;
    /**
     * Various fields for metrics available.
     */
    fields?: oceanic.EmbedField[]
    /**
     * Highest resolution URL for the thumbnail.
     */
    highestResUrl: string;
    /**
     * Duration in miliseconds.
     */
    durationInMs: number;
}