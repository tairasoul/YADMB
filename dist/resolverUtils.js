export default class ResolverUtils {
    resolvers;
    constructor(resolverInfo) {
        this.resolvers = resolverInfo;
    }
    async getAudioResolvers(url) {
        const resolvers = [];
        for (const resolver of this.resolvers.audioResourceResolvers) {
            if (await resolver.available(url))
                resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }
    async getPlaylistResolvers(url) {
        const resolvers = [];
        for (const resolver of this.resolvers.playlistResolvers) {
            if (await resolver.available(url))
                resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }
    async getNameResolvers(url) {
        const resolvers = [];
        for (const resolver of this.resolvers.songResolvers) {
            if (await resolver.available(url))
                resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }
    async getSongResolvers(url) {
        const resolvers = [];
        for (const resolver of this.resolvers.songDataResolvers) {
            if (await resolver.available(url))
                resolvers.push(resolver);
        }
        return resolvers.sort((a, b) => b.priority - a.priority);
    }
    async getSongThumbnail(url) {
        for (const resolver of this.resolvers.songThumbnailResolvers) {
            const resolved = await resolver.resolve(url);
            if (resolved) {
                return resolved;
            }
        }
        return;
    }
    async getPlaylistThumbnail(url) {
        for (const resolver of this.resolvers.playlistThumbnailResolvers) {
            const resolved = await resolver.resolve(url);
            if (resolved) {
                return resolved;
            }
        }
        return;
    }
}
