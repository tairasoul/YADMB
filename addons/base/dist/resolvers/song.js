import { createSocksProxy } from "../../../../dist/types/addonTypes.js";
import playdl from "play-dl";
import ytdl from "@distube/ytdl-core";
function getProvider(url) {
    // no clue if these are all, please open an issue if they are not
    if ([/https:\/\/(?:music|www)\.youtube\.com\/./, /https:\/\/youtu\.be\/./].find((reg) => reg.test(url)))
        return "youtube";
    if ([/https:\/\/soundcloud.com\/./, /https:\/\/on.soundcloud.com\/./].find((reg) => reg.test(url)))
        return "soundcloud";
    if (/https:\/\/deezer\.(?:com|page\.link)\/./.test(url))
        return "deezer";
}
// todo:
// seperate this into multiple resolvers.
// why did i make it all one resolver??
export const base = {
    name: "base",
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/watch\?v=.*/, /https:\/\/youtu\.be\/.*/, /https:\/\/soundcloud\.com\/.*/, /https:\/\/on\.soundcloud\.com\/.*/, /https:\/\/deezer\.(?:com|page\.link)\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url, cache, proxyInfo, forceInvalidation) {
        const provider = getProvider(url);
        return new Promise(async (resolve) => {
            switch (provider) {
                case "youtube":
                    let agent;
                    if (proxyInfo)
                        agent = createSocksProxy({ uri: `socks4://${proxyInfo.auth ? `${proxyInfo.auth}@` : ""}${proxyInfo.url}:${proxyInfo.port}` });
                    if (!ytdl.validateURL(url)) {
                        resolve("Invalid URL!");
                    }
                    const y_url = new URL(url);
                    const id = y_url.searchParams.get("v");
                    if (forceInvalidation)
                        await cache.uncache("youtube-song-data", id);
                    const cached = await cache.get("youtube-song-data", id);
                    if (cached) {
                        resolve({
                            url: cached.extra.url,
                            title: cached.title
                        });
                        break;
                    }
                    const info = await ytdl.getBasicInfo(url, { agent });
                    const title = info.videoDetails.title;
                    await cache.cache("youtube-song-data", {
                        title: info.videoDetails.title,
                        id,
                        extra: {
                            url
                        }
                    });
                    console.log(`cached ${id}`);
                    resolve({
                        url,
                        title
                    });
                    break;
                case "deezer":
                    const d_url = new URL(url);
                    const d_id = d_url.pathname;
                    if (forceInvalidation)
                        await cache.uncache("deezer-song-data", d_id);
                    const dcached = await cache.get("deezer-song-data", d_id);
                    if (dcached) {
                        resolve({
                            url: dcached.extra.url,
                            title: dcached.title
                        });
                        break;
                    }
                    const dvid = await playdl.deezer(url);
                    if (dvid.type != "track") {
                        resolve("Deezer url must be a track.");
                    }
                    const yvid = (await playdl.search(dvid.title, {
                        limit: 1
                    }))[0];
                    await cache.cache("deezer-song-data", {
                        title: dvid.title,
                        id: d_id,
                        extra: {
                            url: yvid.url
                        }
                    });
                    resolve({
                        title: dvid.title,
                        url: yvid.url
                    });
                    break;
                case "soundcloud":
                    const s_url = new URL(url);
                    const s_id = s_url.pathname;
                    if (forceInvalidation)
                        await cache.uncache("soundcloud-song-data", s_id);
                    const scached = await cache.get("soundcloud-song-data", s_id);
                    if (scached) {
                        resolve({
                            title: scached.title,
                            url
                        });
                        break;
                    }
                    const sinfo = await playdl.soundcloud(url);
                    await cache.cache("soundcloud-song-data", {
                        title: sinfo.name,
                        id: s_id,
                        extra: {}
                    });
                    resolve({
                        title: sinfo.name,
                        url: url
                    });
                    break;
            }
        });
    }
};
