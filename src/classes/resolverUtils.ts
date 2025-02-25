import ytdl from "@distube/ytdl-core";
import { AudioResolver, PagerResolver, Proxy, dataResolver, playlistResolver, resolver } from "../types/addonTypes";
import Cache from "./cache.js";
import { ResolverInformation } from "./client.js";

export default class ResolverUtils {
    public resolvers: ResolverInformation;
    constructor(resolverInfo: ResolverInformation) {
        this.resolvers = resolverInfo;
    }

    async getPagers(url: string): Promise<PagerResolver[]> {
        const resolvers: PagerResolver[] = [];
        for (const resolver of this.resolvers.pagers) {
            if (await resolver.available(url)) resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }

    async getAudioResolvers(url: string): Promise<AudioResolver[]> {
        const resolvers: AudioResolver[] = [];
        for (const resolver of this.resolvers.audioResourceResolvers) {
            if (await resolver.available(url)) resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }

    async getPlaylistResolvers(url: string): Promise<playlistResolver[]> {
        const resolvers: playlistResolver[] = [];
        for (const resolver of this.resolvers.playlistResolvers) {
            if (await resolver.available(url)) resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }

    async getNameResolvers(url: string): Promise<resolver[]> {
        const resolvers: resolver[] = [];
        for (const resolver of this.resolvers.songResolvers) {
            if (await resolver.available(url)) resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }

    async getSongResolvers(url: string): Promise<dataResolver[]> {
        const resolvers: dataResolver[] = [];
        for (const resolver of this.resolvers.songDataResolvers) {
            if (await resolver.available(url)) resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }

    async getSongThumbnail(url: string, cache: Cache, proxyInfo: Proxy | undefined, authenticatedAgent: ytdl.Agent | undefined, forceInvalidation: boolean = false): Promise<string | undefined> {
        for (const resolver of this.resolvers.songThumbnailResolvers) {
            const resolved = await resolver.resolve(url, cache, proxyInfo, authenticatedAgent, forceInvalidation);
            if (resolved) {
                return resolved;
            }
        }
        return;
    }

    async getPlaylistThumbnail(url: string, cache: Cache, proxyInfo: Proxy | undefined, authenticatedAgent: ytdl.Agent | undefined, forceInvalidation: boolean = false): Promise<string | undefined> {
        for (const resolver of this.resolvers.playlistThumbnailResolvers) {
            const resolved = await resolver.resolve(url, cache, proxyInfo, authenticatedAgent, forceInvalidation);
            if (resolved) {
                return resolved;
            }
        }
        return;
    }
}