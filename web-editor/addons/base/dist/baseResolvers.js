import ytdl from "@distube/ytdl-core";
import playdl, { SoundCloudPlaylist } from "play-dl";
playdl.getFreeClientID().then((val) => playdl.setToken({
    soundcloud: {
        client_id: val
    }
}));
const addon = {
    name: "Base Resolvers",
    description: "Base resolvers for web-editor.",
    version: "v1.0.0",
    priority: 0,
    resolvers: [
        {
            name: "youtube",
            description: "Resolves youtube links.",
            async available(url) {
                return [/https:\/\/(?:music|www)\.youtube\.com\/.*/, /https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            async webResolver(url) {
                const info = await ytdl.getInfo(url);
                const author = info.videoDetails.author.name;
                const title = info.videoDetails.title;
                const thumbnail = info.videoDetails.thumbnails[0].url;
                return {
                    songArtist: author,
                    songName: title,
                    songThumbnail: thumbnail,
                    songUrl: url
                };
            },
        },
        {
            name: "soundcloud",
            description: "Resolvers soundcloud links.",
            async available(url) {
                return [/https:\/\/soundcloud\.com\/.*/, /https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            async webResolver(url) {
                const so = await playdl.soundcloud(url);
                if (so instanceof SoundCloudPlaylist) {
                    return {
                        songName: "Soundcloud playlists are not supported. Please remove this element.",
                        songArtist: "",
                        songThumbnail: "",
                        songUrl: ""
                    };
                }
                else {
                    const sound = so;
                    return {
                        songName: sound.name,
                        // @ts-ignore
                        songArtist: sound.publisher.name,
                        songThumbnail: sound.thumbnail,
                        songUrl: url
                    };
                }
            }
        }
    ]
};
export default addon;
