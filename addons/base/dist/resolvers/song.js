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
    async resolve(url, cache) {
        const provider = getProvider(url);
        return new Promise(async (resolve) => {
            switch (provider) {
                case "youtube":
                    if (!ytdl.validateURL(url)) {
                        resolve("Invalid URL!");
                    }
                    const id = playdl.extractID(url);
                    const cached = await cache.get("youtube-song-data", id);
                    if (cached) {
                        resolve({
                            url: cached.extra.url,
                            title: cached.title
                        });
                        break;
                    }
                    const info = await playdl.video_basic_info(url);
                    const title = info.video_details.title;
                    await cache.cache("youtube-song-data", {
                        title: info.video_details.title,
                        id,
                        expires: Date.now() + (3 * 24 * 60 * 60 * 1000),
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
                    const dvid = await playdl.deezer(url);
                    const dcached = await cache.get("deezer-song-data", dvid.id.toString());
                    if (dcached) {
                        resolve({
                            url: dcached.extra.url,
                            title: dcached.title
                        });
                        break;
                    }
                    if (dvid.type != "track") {
                        resolve("Deezer url must be a track.");
                    }
                    const yvid = (await playdl.search(dvid.title, {
                        limit: 1
                    }))[0];
                    await cache.cache("deezer-song-data", {
                        title: dvid.title,
                        id: dvid.id.toString(),
                        expires: Date.now() + (3 * 24 * 60 * 60 * 1000),
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
                    const sinfo = await playdl.soundcloud(url);
                    resolve({
                        title: sinfo.name,
                        url: url
                    });
                    break;
            }
        });
    }
};
