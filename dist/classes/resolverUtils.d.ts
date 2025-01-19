import { AudioResolver, PagerResolver, dataResolver, playlistResolver, resolver } from "../types/addonTypes";
import Cache from "./cache.js";
import { ResolverInformation } from "./client.js";
export default class ResolverUtils {
    resolvers: ResolverInformation;
    constructor(resolverInfo: ResolverInformation);
    getPagers(url: string): Promise<PagerResolver[]>;
    getAudioResolvers(url: string): Promise<AudioResolver[]>;
    getPlaylistResolvers(url: string): Promise<playlistResolver[]>;
    getNameResolvers(url: string): Promise<resolver[]>;
    getSongResolvers(url: string): Promise<dataResolver[]>;
    getSongThumbnail(url: string, cache: Cache, forceInvalidation?: boolean): Promise<string | undefined>;
    getPlaylistThumbnail(url: string, cache: Cache, forceInvalidation?: boolean): Promise<string | undefined>;
}
