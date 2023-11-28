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
const addon = {
    name: "Base Playlist Data Resolvers",
    description: "The base playlist data resolvers for YADMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "playlistDataResolver",
    sources: [
        "https://github.com/tairasoul/YADMB/blob/main/rework/addons/base/basePlaylistResolvers.ts"
    ],
    playlistResolvers: [
        {
            name: "base",
            async available(url) {
                return [/https:\/\/(?:music|www)\.youtube\.com\/(?:watch\?v|playlist?list)=./, /https:\/\/youtu\.be\/(?:watch\?v|playlist?list)v=./, /https:\/\/soundcloud\.com\/./, /https:\/\/on\.soundcloud\.com\/./, /https:\/\/deezer\.(?:com|page\.link)\/./].find((reg) => reg.test(url)) != undefined;
            },
            priority: 0,
            async resolve(url) {
                const prov = getProvider(url);
                const returnVal = {
                    title: "temp",
                    items: [],
                    url: url
                };
                switch (prov) {
                    case "deezer":
                        const playdl_deezer = await playdl.deezer(url);
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
                        }
                        else {
                            return `Deezer url ${url} is not an album or a playlist.`;
                        }
                        return returnVal;
                    case "soundcloud":
                        const playdl_so = await playdl.soundcloud(url);
                        if (playdl_so instanceof SoundCloudPlaylist) {
                            returnVal.title = playdl_so.name;
                            const tracks = await playdl_so.all_tracks();
                            for (const track of tracks) {
                                returnVal.items.push({
                                    title: track.name,
                                    url: track.permalink
                                });
                            }
                        }
                        else {
                            return `Soundcloud url ${url} is not a soundcloud playlist.`;
                        }
                        return returnVal;
                    case "youtube":
                        const playdl_yt = await playdl.playlist_info(url);
                        returnVal.title = playdl_yt.title;
                        for (const track of await playdl_yt.all_videos()) {
                            returnVal.items.push({
                                title: track.title,
                                url: track.url
                            });
                        }
                        return returnVal;
                    default:
                        return `Could not get provider for url ${url}.`;
                }
            },
        }
    ]
};
export default addon;
