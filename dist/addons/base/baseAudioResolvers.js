import playdl from "play-dl";
import { createAudioResource } from "@discordjs/voice";
import utils from "../../utils.js";
const addon = {
    name: "Base Audio Resolvers",
    description: "The base audio resolvers for DMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "audioResourceResolver",
    resourceResolvers: [
        {
            name: "baseResolvers",
            regexMatches: [
                /https:\/\/(?:music|www)\.youtube\.com\/watch\?v=./,
                /https:\/\/youtu.be\/watch\?v=./,
                /https:\/\/soundcloud.com\/./,
                /https:\/\/on.soundcloud.com\/./
            ],
            async resolve(url) {
                const info = await playdl.video_info(url);
                const stream = await playdl.stream_from_info(info);
                const resource = createAudioResource(stream.stream, {
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
                };
            }
        }
    ]
};
export default addon;
