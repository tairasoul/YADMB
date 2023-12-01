import fs from "fs";
import * as oceanic from "oceanic.js";
import { fileURLToPath } from 'url';
import { Guild, default as MusicClient, ResolverInformation, queuedTrack, track } from "./client.js";
import path from "path";
import { AudioResource } from "@discordjs/voice";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
import { debugLog } from "./bot.js";
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
     * Likes for the song.
     * Set to "Unable to fetch likes" if you can't.
     */
    likes: string;
    /**
     * Views, if possible to be fetched.
     * Set to "Unable to fetch views" if you can't.
     */
    views: string;
    /**
     * Highest resolution URL for the thumbnail.
     */
    highestResUrl: string;
    /**
     * Duration in miliseconds.
     */
    durationInMs: number;
}

function isExcluded(filePath: string, exclusionList: string[]) {
    return exclusionList.some(exclusion => {
        if (exclusion.endsWith("*")) {
            const prefix = exclusion.slice(0, -1); // Remove the trailing *
            return filePath.startsWith(prefix);
        } else if (exclusion.startsWith("*")) {
            const suffix = exclusion.slice(1); // Remove the leading *
            return filePath.endsWith(suffix);
        }
      return filePath === exclusion; // Exact match
    });
}

export default class addonLoader {
    private _client: MusicClient;
    private addons: AddonInfo[] = [];
    constructor(client: MusicClient) {
        this._client = client;
    }

    async readAddons() {
        for (const addon of fs.readdirSync(path.join(`${__dirname}`, "..", "addons"))) {
            console.log(`reading addon ${addon}`);
            // if addon is dir, re-call readAddons for addonPath/addon
            if (fs.statSync(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`)
                await this.readAddonFolder(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`);
            }
            // else, continue as normal with importing addon.
            else {
                const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${path.join(`${__dirname}`, "..", "addons")}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`)
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    })
                }
                else {
                    this.addons.push(addonInfo);
                }
            }
            console.log(`addon ${addon} has been read`);
        }
    }

    private async readAddonFolder(addonPath: string) {
        const exclusions: string[] = ["exclusions.json", "node_modules/*", "package.json", "package-lock.json"];
        if (fs.existsSync(`${addonPath}/exclusions.json`)) {
            const newExclusions = JSON.parse(fs.readFileSync(`${addonPath}/exclusions.json`, 'utf8'));
            for (const exclusion of newExclusions) {
                exclusions.push(exclusion.replace(/\//g, "\\"));
            }
        }
        debugLog(`exclusions for ${addonPath}: ${exclusions.join(" ")}`)
        for (const pathname of fs.readdirSync(addonPath, {recursive: true, encoding: "utf8"})) {
            if (!isExcluded(pathname, exclusions) && fs.statSync(`${addonPath}/${pathname}`).isFile()) {
                const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${addonPath}/${pathname}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${path.basename(`${addonPath}/${pathname}`)} has multiple addons, iterating.`)
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${pathname}`);
                        this.addons.push(saddon);
                    })
                }
                else {
                    this.addons.push(addonInfo);
                }
            }
            if (isExcluded(pathname, exclusions)) {
                debugLog(`${pathname} is excluded, skipping.`)
            }
        }
    }

    loadAddons() {
        for (const addon of this.addons) {
            console.log(`loading addon ${addon.name}`);
            this._client.addAddon(addon);
        }
    }

    registerAddons() {
        this._client.registerAddons();
    }
}