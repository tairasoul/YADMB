import playdl, { DeezerAlbum, DeezerPlaylist, SoundCloudPlaylist } from "play-dl";
function getProvider(url) {
    // no clue if these are all, please open an issue if they are not
    if ([/https:\/\/(?:music|www)\.youtube\.com\/./, /https:\/\/youtu.be\/./].find((reg) => reg.test(url)))
        return "youtube";
    if ([/https:\/\/soundcloud.com\/./, /https:\/\/on.soundcloud.com\/./].find((reg) => reg.test(url)))
        return "soundcloud";
    if (/https:\/\/deezer\.(?:com|page\.link)\/./.test(url))
        return "deezer";
}
// todo:
// why did i make these resolvers, of all of them, a single "base" resolver??
// bruh
export const base = {
    name: "base",
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/(?:watch\?v|playlist\?list)=.*/, /https:\/\/youtu\.be\/.*/, /https:\/\/soundcloud\.com\/.*/, /https:\/\/on\.soundcloud\.com\/.*/, /https:\/\/deezer\.(?:com|page\.link)\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url, cache) {
        const prov = getProvider(url);
        const returnVal = {
            title: "temp",
            items: [],
            url: url
        };
        switch (prov) {
            case "deezer":
                const playdl_deezer = await playdl.deezer(url);
                const id = playdl_deezer.id;
                const cached = await cache.get("deezer-playlist-data", id.toString());
                if (cached) {
                    const tracks = JSON.parse(cached.extra.tracks);
                    returnVal.title = cached.title;
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.title,
                            url: track.url
                        });
                    }
                    return returnVal;
                }
                await playdl_deezer.fetch();
                if (playdl_deezer instanceof DeezerPlaylist || playdl_deezer instanceof DeezerAlbum) {
                    returnVal.title = playdl_deezer.title;
                    const tracks = await playdl_deezer.all_tracks();
                    for (const track of tracks) {
                        const search = (await playdl.search(track.title, { source: { youtube: "video" }, limit: 1 }))[0];
                        returnVal.items.push({
                            title: search.title,
                            url: search.url
                        });
                    }
                    await cache.cache("deezer-playlist-data", {
                        id: id.toString(),
                        title: playdl_deezer.title,
                        expires: Date.now() + (3 * 24 * 60 * 60 * 1000),
                        extra: {
                            tracks: JSON.stringify(returnVal.items)
                        }
                    });
                }
                else {
                    return `Deezer url ${url} is not an album or a playlist.`;
                }
                return returnVal;
            case "soundcloud":
                const playdl_so = await playdl.soundcloud(url);
                const scached = await cache.get("soundcloud-playlist-data", playdl_so.id.toString());
                if (scached) {
                    const tracks = JSON.parse(scached.extra.tracks);
                    returnVal.title = scached.title;
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.name,
                            url: track.permalink
                        });
                    }
                    return returnVal;
                }
                if (playdl_so instanceof SoundCloudPlaylist) {
                    returnVal.title = playdl_so.name;
                    const tracks = await playdl_so.all_tracks();
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.name,
                            url: track.permalink
                        });
                    }
                    await cache.cache("soundcloud-playlist-data", {
                        id: playdl_so.id.toString(),
                        title: playdl_so.name,
                        expires: Date.now() + (3 * 24 * 60 * 60 * 1000),
                        extra: {
                            tracks: JSON.stringify(tracks)
                        }
                    });
                }
                else {
                    return `Soundcloud url ${url} is not a soundcloud playlist.`;
                }
                return returnVal;
            case "youtube":
                const y_id = playdl.extractID(url);
                const ycached = await cache.get("youtube-playlist-data", y_id);
                if (ycached) {
                    returnVal.title = ycached.title;
                    const tracks = JSON.parse(ycached.extra.tracks);
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.title,
                            url: track.url
                        });
                    }
                    return returnVal;
                }
                const playdl_yt = await playdl.playlist_info(url);
                returnVal.title = playdl_yt.title;
                const tracks = await playdl_yt.all_videos();
                for (const track of tracks) {
                    returnVal.items.push({
                        title: track.title,
                        url: track.url
                    });
                }
                await cache.cache("youtube-playlist-data", {
                    id: y_id,
                    title: playdl_yt.title,
                    expires: Date.now() + (3 * 24 * 60 * 60 * 1000),
                    extra: {
                        tracks: JSON.stringify(tracks)
                    }
                });
                return returnVal;
            default:
                return `Could not get provider for url ${url}.`;
        }
    }
};
