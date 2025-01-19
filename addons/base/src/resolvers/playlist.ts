import ytpl from "@distube/ytpl";
import { playlistData, playlistResolver } from "../../../../dist/types/addonTypes.js";
import playdl, { DeezerAlbum, DeezerPlaylist, SoundCloudPlaylist, SoundCloudTrack, YouTubeVideo } from "play-dl";
import ytdl from "@distube/ytdl-core";

function getProvider(url: string) {
    // no clue if these are all, please open an issue if they are not
    if ([/https:\/\/(?:music|www)\.youtube\.com\/./, /https:\/\/youtu.be\/./].find((reg) => reg.test(url))) return "youtube";
    if ([/https:\/\/soundcloud.com\/./, /https:\/\/on.soundcloud.com\/./].find((reg) => reg.test(url))) return "soundcloud"
    if (/https:\/\/deezer\.(?:com|page\.link)\/./.test(url)) return "deezer";
}

// todo:
// why did i make these resolvers, of all of them, a single "base" resolver??
// bruh

export const base: playlistResolver = {
    name: "base",
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/(?:watch\?v|playlist\?list)=.*/,/https:\/\/youtu\.be\/.*/,/https:\/\/soundcloud\.com\/.*/,/https:\/\/on\.soundcloud\.com\/.*/,/https:\/\/deezer\.(?:com|page\.link)\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url, cache, forceInvalidation) {
        const prov = getProvider(url);
        const returnVal: playlistData = {
            title: "temp",
            items: [],
            url: url
        }
        switch(prov) {
            case "deezer":
                const d_url = new URL(url);
                if (forceInvalidation)
                    await cache.uncache("deezer-playlist-data", d_url.pathname);
                const cached = await cache.get("deezer-playlist-data", d_url.pathname);
                if (cached) {
                    const tracks = JSON.parse(cached.extra.tracks) as YouTubeVideo[];
                    returnVal.title = cached.title;
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.title as string,
                            url: track.url
                        })
                    }
                    return returnVal;
                }
                const playdl_deezer = await playdl.deezer(url);
                await playdl_deezer.fetch();
                if (playdl_deezer instanceof DeezerPlaylist || playdl_deezer instanceof DeezerAlbum) {
                    returnVal.title = playdl_deezer.title;
                    const tracks = await playdl_deezer.all_tracks();
                    for (const track of tracks) {
                        const search = (await playdl.search(track.title, {source: { youtube: "video"}, limit: 1}))[0];
                        returnVal.items.push({
                            title: search.title as string,
                            url: search.url
                        })
                    }
                    await cache.cache("deezer-playlist-data", {
                        id: d_url.pathname,
                        title: playdl_deezer.title,
                        extra: {
                            tracks: JSON.stringify(returnVal.items)
                        }
                    })
                }
                else {
                    return `Deezer url ${url} is not an album or a playlist.`;
                }
                return returnVal;
            case "soundcloud":
                const s_url = new URL(url);
                if (forceInvalidation)
                    await cache.uncache("soundcloud-playlist-data", s_url.pathname);
                const scached = await cache.get("soundcloud-playlist-data", s_url.pathname);
                if (scached) {
                    const tracks = JSON.parse(scached.extra.tracks) as SoundCloudTrack[];
                    returnVal.title = scached.title;
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.name,
                            url: track.permalink
                        })
                    }
                    return returnVal;
                }
                const playdl_so = await playdl.soundcloud(url);
                if (playdl_so instanceof SoundCloudPlaylist) {
                    returnVal.title = playdl_so.name;
                    const tracks = await playdl_so.all_tracks();
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.name,
                            url: track.permalink
                        })
                    }
                    await cache.cache("soundcloud-playlist-data", {
                        id: s_url.pathname,
                        title: playdl_so.name,
                        extra: {
                            tracks: JSON.stringify(tracks)
                        }
                    })
                }
                else {
                    return `Soundcloud url ${url} is not a soundcloud playlist.`
                }
                return returnVal;
            case "youtube":
                const y_id = await ytpl.getPlaylistID(url);
                if (forceInvalidation)
                    await cache.uncache("youtube-playlist-data", y_id);
                const ycached = await cache.get("youtube-playlist-data", y_id);
                if (ycached) {
                    returnVal.title = ycached.title;
                    const tracks = JSON.parse(ycached.extra.tracks) as YouTubeVideo[];
                    for (const track of tracks) {
                        returnVal.items.push({
                            title: track.title as string,
                            url: track.url
                        })
                    }
                    return returnVal;
                }
                const playdl_yt = await ytpl(url);
                returnVal.title = playdl_yt.title as string;
                const tracks = playdl_yt.items;
                for (const track of tracks) {
                    returnVal.items.push({
                        title: track.title as string,
                        url: track.url
                    })
                }
                await cache.cache("youtube-playlist-data", {
                    id: y_id,
                    title: playdl_yt.title as string,
                    extra: {
                        tracks: JSON.stringify(tracks)
                    }
                })
                return returnVal;
            default:
                return `Could not get provider for url ${url}.`;
        }
    }
}
