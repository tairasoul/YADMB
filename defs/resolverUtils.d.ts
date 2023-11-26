import { AudioResolver, dataResolver, playlistResolver, resolver } from "./addonLoader";
import { ResolverInformation } from "./client.js";
export default class ResolverUtils {
    private resolvers;
    constructor(resolverInfo: ResolverInformation);
    findAudioResolver(url: string): AudioResolver | undefined;
    findPlaylistResolver(url: string): playlistResolver | undefined;
    findNameResolver(url: string): resolver | undefined;
    findSongResolver(url: string): dataResolver | undefined;
    getSongThumbnail(url: string): Promise<string | undefined>;
    getPlaylistThumbnail(url: string): Promise<string | undefined>;
}
