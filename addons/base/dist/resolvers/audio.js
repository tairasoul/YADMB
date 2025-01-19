import playdl from "play-dl";
import { createAudioResource } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import utils from "../../../../dist/utils.js";
export const youtube = {
    name: "youtube-resolver",
    priority: 0,
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/watch\?v=.*/, /https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    async resolve(url) {
        const info = await ytdl.getInfo(url);
        console.log("info available");
        const stream = ytdl(url);
        console.log("waiting for stream to be readable");
        await new Promise((resolve) => stream.on("readable", resolve));
        //const info = await playdl.video_info(url);
        //const stream = await playdl.stream_from_info(info, { discordPlayerCompatibility: true });
        const resource = createAudioResource(stream, {
            inlineVolume: true
        });
        console.log("audio resolve() debug info");
        console.log(resource);
        return {
            resource,
            info: {
                channelName: info.videoDetails.ownerChannelName || "Could not get channel name.",
                durationInMs: parseInt(info.videoDetails.lengthSeconds) * 1000,
                fields: [
                    { name: "Likes", value: info.videoDetails.likes ?? "Could not retrieve likes" },
                    { name: "Views", value: info.videoDetails.viewCount }
                ],
                highestResUrl: utils.getHighestResUrl(info)
            }
        };
    }
};
export const soundcloud = {
    name: "soundcloud-resolver",
    async available(url) {
        return [/https:\/\/soundcloud\.com\/.*/, /https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url) {
        const so = await playdl.soundcloud(url);
        const stream = await playdl.stream(url);
        const resource = createAudioResource(stream.stream, {
            inlineVolume: true,
            inputType: stream.type
        });
        return {
            resource,
            info: {
                channelName: so.publisher?.name || so.publisher?.artist || "Could not get publisher name.",
                durationInMs: so.durationInMs,
                highestResUrl: so.thumbnail
            }
        };
    }
};
