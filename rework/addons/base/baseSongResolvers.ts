import { AddonInfo } from "../../addonLoader.js";
import playdl from "play-dl";
import { createAudioResource } from "@discordjs/voice";
import utils from "../../utils.js";
import ytdl from "@distube/ytdl-core";

function getProvider(url: string) {
    // no clue if these are all, please open an issue if they are not
    if ([/https:\/\/(?:music|www)\.youtube\.com\/./, /https:\/\/youtu\.be\/./].find((reg) => reg.test(url))) return "youtube";
    if ([/https:\/\/soundcloud.com\/./, /https:\/\/on.soundcloud.com\/./].find((reg) => reg.test(url))) return "soundcloud"
    if (/https:\/\/deezer\.(?:com|page\.link)\/./.test(url)) return "deezer";
}

const addon: AddonInfo = {
    name: "Base Song Data Resolvers",
    description: "The base song data resolvers for YADMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "songDataResolver",
    sources: [
        "https://github.com/tairasoul/YADMB/blob/main/rework/addons/base/baseSongResolvers.ts"
    ],
    dataResolvers: [
        {
            name: "base",
            regexMatches: [
                /https:\/\/(?:music|www)\.youtube\.com\/watch\?v=./,
                /https:\/\/youtu\.be\/watch\?v=./,
                /https:\/\/soundcloud\.com\/./,
                /https:\/\/on\.soundcloud\.com\/./,
                /https:\/\/deezer\.(?:com|page\.link)\/./
            ],
            async resolve(url) {
                const provider = getProvider(url);
                return new Promise(async (resolve) => {
                    switch(provider) {
                        case "youtube":
                            if (!ytdl.validateURL(url)) {
                                resolve("Invalid URL!");
                            }
                            const info = await playdl.video_basic_info(url);
                            const title = info.video_details.title as string;
                            resolve(
                                {
                                    url,
                                    title
                                }
                            )
                            break;
                        case "deezer":
                            const dvid = await playdl.deezer(url);
                            if (dvid.type != "track") {
                                resolve("Deezer url must be a track.");
                            }
                            const yvid = (await playdl.search(dvid.title, {
                                limit: 1
                            }))[0]
                            resolve(
                                {
                                    title: dvid.title,
                                    url: yvid.url
                                }
                            )
                            break;
                        case "soundcloud":
                            const sinfo = await playdl.soundcloud(url);
                            resolve(
                                {
                                    title: sinfo.name,
                                    url: url
                                }
                            )
                            break;
                    }
                })
            }
        }
    ]
}

export default addon;