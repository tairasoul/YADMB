import ytdl from "@distube/ytdl-core";
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
                const thumbnail = info.videoDetails.thumbnail.thumbnails[0].url;
                return {
                    songArtist: author,
                    songName: title,
                    songThumbnail: thumbnail
                };
            },
        }
    ]
};
export default addon;
