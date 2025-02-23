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
    async resolve(url, proxyInfo, authenticatedAgent) {
        let agent;
        console.log("creating agent (if needed)");
        if (proxyInfo)
            agent = ytdl.createProxyAgent({ uri: `http://${proxyInfo.auth ? `${proxyInfo.auth}@` : ""}${proxyInfo.url}:${proxyInfo.port}` });
        console.log("getting info");
        const info = await ytdl.getInfo(url, { agent: agent ?? authenticatedAgent });
        console.log("info available");
        const stream = info.formats.filter(f => f.hasAudio && (!f.isLive || f.isHLS))
            .sort((a, b) => Number(b.audioBitrate) - Number(a.audioBitrate) || Number(a.bitrate) - Number(b.bitrate))[0];
        //const info = await playdl.video_info(url);
        //const stream = await playdl.stream_from_info(info, { discordPlayerCompatibility: true });
        const resource = createAudioResource(stream.url, {
            inlineVolume: true
        });
        return {
            resource,
            info: {
                channelName: info.videoDetails.ownerChannelName || "Could not get channel name.",
                durationInMs: parseInt(info.videoDetails.lengthSeconds) * 1000,
                fields: [
                    { name: "Likes", value: info.videoDetails.likes?.toString() ?? "Could not retrieve likes" },
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
