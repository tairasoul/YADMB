import { AddonInfo } from "../../addonLoader.js";
import playdl from "play-dl";
import { createAudioResource } from "@discordjs/voice";
import utils from "../../utils.js";
import ytdl from "@distube/ytdl-core";
import { queuedTrack } from "../../client.js";

function startsWith(str: string, strings: string[]) {
    for (const string of strings) {
        if (str.startsWith(string)) return true;
    }
    return false
}

function getProvider(url: string) {
    // no clue if these are all, please open an issue if they are not
    const youtube = ["https://www.youtube.com", "https://youtu.be", "https://music.youtube.com"];
    const sc = ["https://soundcloud.com", "https://on.soundcloud.com"];
    const deezer = ["https://www.deezer.com"];
    const spotify = ["https://open.spotify.com"];
    if (startsWith(url, youtube)) return "youtube";
    if (startsWith(url, sc)) return "soundcloud";
    if (startsWith(url, deezer)) return "deezer";
    if (startsWith(url, spotify)) return "spotify";
}

const addon: AddonInfo = {
    name: "Base Song Data Resolvers",
    description: "The base song data resolvers for DMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "songDataResolver",
    dataResolvers: [
        {
            name: "base",
            regexMatches: [
                /https:\/\/(?:music|www)\.youtube\.com\/watch\?v=./,
                /https:\/\/youtu.be\/watch\?v=./,
                /https:\/\/soundcloud.com\/./,
                /https:\/\/on.soundcloud.com\/./,
                /https:\/\/deezer.(?:com|.page.link)\/./,
                /https:\/\/open.spotify.com\/track\/./
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
                        case "spotify":
                            try {
                                if (playdl.is_expired()) {
                                    await playdl.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
                                }
                            } catch {}
                            const sp_data = await playdl.spotify(url);
                            if (sp_data.type !== "track") {
                                resolve("Spotify url must be a track.");
                            }

                            const search = (await playdl.search(sp_data.name, { limit: 1}))[0];
                            resolve(
                                {
                                    title: sp_data.name,
                                    url: search.url
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