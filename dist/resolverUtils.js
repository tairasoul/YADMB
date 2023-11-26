export default class ResolverUtils {
    resolvers;
    constructor(resolverInfo) {
        this.resolvers = resolverInfo;
    }
    findAudioResolver(url) {
        for (const resolver of this.resolvers.audioResourceResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url)))
                return resolver;
        }
    }
    findPlaylistResolver(url) {
        for (const resolver of this.resolvers.playlistResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url)))
                return resolver;
        }
    }
    findNameResolver(url) {
        for (const resolver of this.resolvers.songResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url)))
                return resolver;
        }
    }
    findSongResolver(url) {
        for (const resolver of this.resolvers.songDataResolvers) {
            if (resolver.regexMatches.find((reg) => reg.test(url)))
                return resolver;
        }
    }
    async getSongThumbnail(url) {
        for (const resolver of this.resolvers.songThumbnailResolvers) {
            const resolved = await resolver.resolve(url);
            if (resolved) {
                return resolved;
            }
        }
        return undefined;
    }
    async getPlaylistThumbnail(url) {
        for (const resolver of this.resolvers.playlistThumbnailResolvers) {
            const resolved = await resolver.resolve(url);
            if (resolved) {
                return resolved;
            }
        }
        return undefined;
    }
}
