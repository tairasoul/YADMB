import * as builders from "@oceanicjs/builders";
import playdl from "play-dl";
import { getHighestResUrl } from "../../../dist/utils.js";
import humanizeDuration from "humanize-duration";
const addon = {
    name: "Base Pagers",
    description: "The base pagers for YADMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "pagerAddon",
    sources: [
        "https://github.com/tairasoul/YADMB/blob/main/addons/base/pagers.ts"
    ],
    pagers: [
        {
            name: "youtube",
            priority: 0,
            async available(url) {
                return [/https:\/\/(?:music|www)\.youtube\.com\/watch\?v=.*/, /https:\/\/youtu\.be\/watch\?v=.*/].find((reg) => reg.test(url)) != undefined;
            },
            async queuedPager(track, index) {
                const embed = new builders.EmbedBuilder();
                embed.setTitle(track.name);
                embed.addField("index", index.toString(), true);
                embed.addField("type", track.type, true);
                embed.addField("songs", track.tracks.length.toString(), true);
                const info = await playdl.video_basic_info(track.tracks[0].url);
                embed.setImage(getHighestResUrl(info));
                const data = {
                    id: track.name,
                    type: track.type,
                    index,
                    embed
                };
                return data;
            },
            async trackPager(track, index) {
                const embed = new builders.EmbedBuilder();
                embed.setTitle(track.name);
                const info = await playdl.video_basic_info(track.url);
                embed.setImage(getHighestResUrl(info));
                // @ts-ignore
                embed.addField("Author", info.video_details.channel.name);
                embed.addField("Likes", info.video_details.likes.toString());
                embed.addField("Views", info.video_details.views.toString());
                embed.addField("Duration", humanizeDuration(info.video_details.durationInSec * 1000));
                embed.addField("Uploaded", new Date(info.video_details.uploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
                return {
                    id: track.name,
                    type: "song",
                    index,
                    embed
                };
            }
        },
        {
            name: "soundcloud",
            priority: 0,
            async available(url) {
                return [/https:\/\/soundcloud\.com\/*./, /https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            async queuedPager(track, index) {
                const embed = new builders.EmbedBuilder();
                embed.setTitle(track.name);
                const info = await playdl.soundcloud(track.tracks[0].url);
                embed.setImage(info.thumbnail);
                // @ts-ignore
                embed.addField("Author", info.publisher?.artist);
                embed.addField("Duration", humanizeDuration(info.durationInSec * 1000));
                return {
                    id: track.name,
                    type: track.type,
                    index,
                    embed
                };
            },
            async trackPager(track, index) {
                const embed = new builders.EmbedBuilder();
                embed.setTitle(track.name);
                const info = await playdl.soundcloud(track.url);
                embed.setImage(info.thumbnail);
                // @ts-ignore
                embed.addField("Author", info.publisher?.artist);
                embed.addField("Duration", humanizeDuration(info.durationInSec * 1000));
                return {
                    id: track.name,
                    type: "song",
                    index,
                    embed
                };
            }
        }
    ]
};
export default addon;
