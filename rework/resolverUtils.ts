import { AudioResolver, dataResolver, playlistResolver, resolver } from "./addonLoader";
import { ResolverInformation } from "./client.js";

export default class ResolverUtils {
    private resolvers: ResolverInformation;
    constructor(resolverInfo: ResolverInformation) {
        this.resolvers = resolverInfo;
    }

    findAudioResolver(url: string): AudioResolver | undefined {
        for (const resolver of this.resolvers.audioResourceResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url))) return resolver;
        }
    }

    findPlaylistResolver(url: string): playlistResolver | undefined {
        for (const resolver of this.resolvers.playlistResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url))) return resolver;
        }
    }

    findNameResolver(url: string): resolver | undefined {
        for (const resolver of this.resolvers.songResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url))) return resolver;
        }
    }

    findSongResolver(url: string): dataResolver | undefined {
        for (const resolver of this.resolvers.songDataResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url))) return resolver;
        }
    }

    async getSongThumbnail(url: string): Promise<string | undefined> {
        for (const resolver of this.resolvers.songThumbnailResolvers) {
            const resolved = await resolver.resolve(url);
            if (resolved) {
                return resolved;
            }
        }
        return undefined;
    }

    async getPlaylistThumbnail(url: string): Promise<string | undefined> {
        for (const resolver of this.resolvers.playlistThumbnailResolvers) {
            const resolved = await resolver.resolve(url);
            if (resolved) {
                return resolved;
            }
        }
        return undefined;
    }
}