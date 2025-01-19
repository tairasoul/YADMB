import { PageData, PagerResolver } from "../../../../dist/types/addonTypes";
import * as builders from "@oceanicjs/builders"
import playdl, { SoundCloudTrack } from "play-dl";
import { getHighestResUrl } from "../../../../dist/utils.js";
import humanizeDuration from "humanize-duration";
import ytdl from "@distube/ytdl-core";


export const youtube: PagerResolver = {
    name: "youtube",
    priority: 0,
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/watch\?v=.*/,/https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    async queuedPager(track, index, cache, forceInvalidation) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const url = new URL(track.tracks[0].url);
        const id = url.searchParams.get("v") as string;
        embed.addField("index", index.toString(), true)
        embed.addField("type", track.type, true)
        embed.addField("songs", track.tracks.length.toString(), true)
        if (forceInvalidation)
            await cache.uncache("youtube-queued-pager-data", id);
        const cachedata = await cache.get("youtube-queued-pager-data", id);
        if (cachedata) {
            embed.setImage(cachedata.extra.thumbnail)
            // @ts-ignore
            embed.addField("Author", cachedata.extra.channelname);
            embed.addField("Likes", cachedata.extra.likes.toString());
            embed.addField("Views", cachedata.extra.views.toString());
            embed.addField("Duration", humanizeDuration(cachedata.extra.durationInSec * 1000));
            embed.addField("Uploaded", new Date(cachedata.extra.uploadedAt as string).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"}));
        }
        else {
            const info = await ytdl.getInfo(track.tracks[0].url)
            const thumbnail = getHighestResUrl(info);
            embed.setImage(thumbnail);
            embed.addField("Author", info.videoDetails.ownerChannelName);
            embed.addField("Likes", info.videoDetails.likes?.toString() ?? "Could not retrieve likes.");
            embed.addField("Views", info.videoDetails.viewCount);
            embed.addField("Duration", humanizeDuration(parseInt(info.videoDetails.lengthSeconds) * 1000));
            embed.addField("Uploaded", new Date(info.videoDetails.uploadDate).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"}));
            await cache.cache("youtube-queued-pager-data", {
                id,
                title: track.name,
                extra: {
                    channelname: info.videoDetails.ownerChannelName,
                    likes: info.videoDetails.likes?.toString() ?? "Could not get likes",
                    views: info.videoDetails.viewCount,
                    durationInSec: parseInt(info.videoDetails.lengthSeconds),
                    uploadedAt: info.videoDetails.uploadDate,
                    thumbnail
                }
            })
        }
        const data: PageData = {
            id: track.name,
            type: track.type,
            index,
            embed
        };
        return data;
    },
    async trackPager(track, index, cache, forceInvalidation) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const url = new URL(track.url);
        const id = url.searchParams.get("v") as string;
        if (forceInvalidation)
            await cache.uncache("youtube-track-pager-data", id);
        const data = await cache.get("youtube-track-pager-data", id);
        if (data) {
            embed.setImage(data.extra.thumbnail);
            // @ts-ignore
            embed.addField("Author", data.extra.channelname);
            embed.addField("Likes", data.extra.likes.toString());
            embed.addField("Views", data.extra.views.toString());
            embed.addField("Duration", humanizeDuration(data.extra.durationInSec * 1000));
            embed.addField("Uploaded", new Date(data.extra.uploadedAt as string).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"}));
        }
        else {
            const info = await ytdl.getInfo(track.url)
            const thumbnail = getHighestResUrl(info);
            cache.cache("youtube-track-pager-data", {
                id,
                title: track.name,
                extra: {
                    channelname: info.videoDetails.ownerChannelName,
                    likes: info.videoDetails.likes?.toString() ?? "Could not get likes",
                    views: info.videoDetails.viewCount,
                    durationInSec: parseInt(info.videoDetails.lengthSeconds),
                    uploadedAt: info.videoDetails.uploadDate,
                    thumbnail
                }
            })
            embed.setImage(thumbnail);
            embed.addField("Author", info.videoDetails.ownerChannelName);
            embed.addField("Likes", info.videoDetails.likes?.toString() ?? "Could not retrieve likes.");
            embed.addField("Views", info.videoDetails.viewCount);
            embed.addField("Duration", humanizeDuration(parseInt(info.videoDetails.lengthSeconds) * 1000));
            embed.addField("Uploaded", new Date(info.videoDetails.uploadDate).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"}));
        }
        return {
            id: track.name,
            type: "song",
            index,
            embed
        } as PageData
    }
}

export const soundcloud: PagerResolver = {
    name: "soundcloud",
    priority: 0,
    async available(url) {
        return [/https:\/\/soundcloud\.com\/*./,/https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    async queuedPager(track, index) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const info = await playdl.soundcloud(track.tracks[0].url) as SoundCloudTrack;
        embed.setImage(info.thumbnail);
        // @ts-ignore
        embed.addField("Author", info.publisher?.artist ?? "Could not get artist.");
        embed.addField("Duration", humanizeDuration(info.durationInSec * 1000));
        return {
            id: track.name,
            type: track.type,
            index,
            embed
        } as PageData
    },
    async trackPager(track, index) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const info = await playdl.soundcloud(track.url) as SoundCloudTrack;
        embed.setImage(info.thumbnail);
        // @ts-ignore
        embed.addField("Author", info.publisher?.artist ?? "Could not get artist.");
        embed.addField("Duration", humanizeDuration(info.durationInSec * 1000));
        return {
            id: track.name,
            type: "song",
            index,
            embed
        } as PageData
    }
}