import { AddonInfo } from "../../addonLoader.js";
import playdl, { SoundCloudStream, SoundCloudTrack } from "play-dl";
import { createAudioResource } from "@discordjs/voice";
import utils from "../../utils.js";

const addon: AddonInfo = {
    name: "Base Audio Resolvers",
    description: "The base audio resolvers for YADMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "audioResourceResolver",
    sources: [
        "https://github.com/tairasoul/YADMB/blob/main/rework/addons/base/baseAudioResolvers.ts"
    ],
    resourceResolvers: [
        {
            name: "youtube-resolver",
            regexMatches: [
                /https:\/\/(?:music|www)\.youtube\.com\/watch\?v=./,
                /https:\/\/youtu\.be\/watch\?v=./
            ],
            async resolve(url) {
                const info = await playdl.video_info(url);
                const stream = await playdl.stream_from_info(info);
                const resource = createAudioResource<any>(stream.stream, {
                    inlineVolume: true,
                    inputType: stream.type
                });
                return {
                    resource,
                    info: {
                        channelName: info.video_details.channel?.name || "Could not get channel name.",
                        durationInMs: info.video_details.durationInSec * 1000,
                        likes: info.video_details.likes.toString(),
                        views: info.video_details.views.toString(),
                        highestResUrl: utils.getHighestResUrl(info)
                    }
                }
            }
        },
        {
            name: "soundcloud-resolver",
            regexMatches: [
                /https:\/\/soundcloud\.com\/./,
                /https:\/\/on\.soundcloud\.com\/./
            ],
            async resolve(url) {
                const so = await playdl.soundcloud(url) as SoundCloudTrack;
                const stream = await playdl.stream(url) as SoundCloudStream;
                const resource = createAudioResource<any>(stream.stream, {
                    inlineVolume: true,
                    inputType: stream.type
                });
                return {
                    resource,
                    info: {
                        channelName: so.publisher?.name || so.publisher?.artist || "Could not get publisher name.",
                        durationInMs: so.durationInMs,
                        likes: "Likes are not available for SoundCloud.",
                        views: "Views are not available for SoundCloud.",
                        highestResUrl: so.thumbnail
                    }
                }
            }
        }
    ]
}

export default addon;