import { AudioResource } from "@discordjs/voice";
import MusicClient, { Guild, queuedTrack } from "../classes/client";
import * as oceanic from "oceanic.js";
import { EmbedBuilder } from "@oceanicjs/builders";
import { track } from "../classes/client";
import ResolverUtils from "../classes/resolverUtils.js";
import Cache from "../classes/cache.js";
import { ProxyAgent } from "undici";
import { canonicalDomain, Cookie, CookieJar } from "tough-cookie";
import { CookieClient } from "http-cookie-agent/undici"
import { SocksProxyAgent } from "socks-proxy-agent";

export type Proxy = {
    url: string;
    port: number;
    auth?: string;
}

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
     * @param track The track being paged.
     * @param index The index of the track being paged.
     * @param cache The global cache. Use this to cache and retrieve data for the track.
     * @param proxyInfo The active proxy (if any.)
     * @param forceInvalidation Is cache invalidation being forced for this? The cache doesn't automatically invalidate it, so you'll need to just add this to whatever valid checks you're doing.
     */
    queuedPager: (track: queuedTrack, index: number, cache: Cache, proxyInfo: Proxy | undefined, forceInvalidation: boolean) => Promise<PageData>;
    /**
     * Pager for a track within a playlist.
     * @param track The track being paged.
     * @param index The index of the track being paged.
     * @param cache The global cache. Use this to cache and retrieve data for the track.
     * @param proxyInfo The active proxy (if any.)
     * @param forceInvalidation Is cache invalidation being forced for this? The cache doesn't automatically invalidate it, so you'll need to just add this to whatever valid checks you're doing.
     */
    trackPager: (track: track, index: number, cache: Cache, proxyInfo: Proxy | undefined, forceInvalidation: boolean) => Promise<PageData>;
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
     * @param url The song URL.
     * @param proxyInfo The active proxy (if any.)
     */
    resolve: (url: string, proxyInfo: Proxy | undefined) => Promise<{resource: AudioResource<any>, info: infoData} | undefined>;
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
     * @param url The URL of the song.
     * @param cache The global cache. Use this to cache and retrieve data for the URL.
     * @param proxyInfo The active proxy (if any.)
     * @param forceInvalidation Is cache invalidation being forced for this call? The cache doesn't automatically invalidate it, so you'll need to just add this to whatever valid checks you're doing.
     */
    resolve: (url: string, cache: Cache, proxyInfo: Proxy | undefined, forceInvalidation: boolean) => Promise<songData | string | undefined>;
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
     * @param url The URL of the playlist.
     * @param cache The global cache. Use this to cache and retrieve data for the URL.
     * @param proxyInfo The active proxy (if any.)
     * @param forceInvalidation Is cache invalidation being forced for this call? The cache doesn't automatically invalidate it, so you'll need to just add this to whatever valid checks you're doing.
     */
    resolve: (url: string, cache: Cache, proxyInfo: Proxy | undefined, forceInvalidation: boolean) => Promise<playlistData | string | undefined>;
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
     * @param url The URL to get thumbnail for.
     * @param cache The global cache. Use this to cache and retrieve data for the URL.
     * @param forceInvalidation Is cache invalidation being forced for this call? The cache doesn't automatically invalidate it, so you'll need to just add this to whatever valid checks you're doing.
     */
    resolve: (url: string, cache: Cache, forceInvalidation: boolean) => Promise<string | undefined>;
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
    callback: (interaction: oceanic.CommandInteraction, info: {
        resolvers: ResolverUtils, 
        guild: Guild, 
        client: MusicClient,
        cache: Cache
    }) => any;
}

export type data_resolvers = {
    thumbnail?: thumbnailResolver[];
    playlist?: playlistResolver[];
    songData?: dataResolver[];
    audio?: AudioResolver[];
    pager?: PagerResolver[];
    provider?: resolver[];
}

export type AddonData = {
    resolvers: data_resolvers;
    commands?: command[];
} | {
    resolvers?: data_resolvers;
    commands: command[];
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
     * The data for the addon. Contains the resolvers and commands the addon uses.
     */
    data: AddonData;
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
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

const convertCookie = (cookie: any) =>
    cookie instanceof Cookie
      ? cookie
      : new Cookie({
          key: cookie.name,
          value: cookie.value,
          expires: typeof cookie.expirationDate === "number" ? new Date(cookie.expirationDate * 1000) : "Infinity",
          domain: canonicalDomain(cookie.domain),
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: convertSameSite(cookie.sameSite),
          hostOnly: cookie.hostOnly,
        });

const addCookies = (jar: CookieJar, cookies: { domain: string; hostOnly: boolean; httpOnly: boolean; name: string; path: string; sameSite: string; secure: boolean; session: boolean; value: string; }[]) => {
    if (!cookies || !Array.isArray(cookies)) {
      throw new Error("cookies must be an array");
    }
    if (!cookies.some(c => c.name === "SOCS")) {
      cookies.push({
        domain: ".youtube.com",
        hostOnly: false,
        httpOnly: false,
        name: "SOCS",
        path: "/",
        sameSite: "lax",
        secure: true,
        session: false,
        value: "CAI",
      });
    }
    for (const cookie of cookies) {
      jar.setCookieSync(convertCookie(cookie), "https://www.youtube.com");
    }
  };


export function createSocksProxy(options: ProxyAgent.Options, cookies = []) {
    if (!cookies) cookies = [];
    if (typeof options === "string") options = { uri: options };
    if (options.factory) throw new Error("Cannot use factory with createProxyAgent");
    const jar = new CookieJar();
    addCookies(jar, cookies);
    const proxyOptions = Object.assign(
      {
        factory: (origin: any, opts: any) => {
          const o = Object.assign({ cookies: { jar } }, opts);
          return new CookieClient(origin, o);
        },
      },
      options,
    );
    const agent = new SocksProxyAgent(options.uri);
    const dispatcher = new ProxyAgent(proxyOptions);
  
    return { dispatcher, agent, jar, localAddress: options.localAddress };
};
function convertSameSite(sameSite: any): string | undefined {
    throw new Error("Function not implemented.");
}

