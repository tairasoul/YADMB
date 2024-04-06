import { AddonInfo } from "../../../dist/addonTypes.js";
import { youtube as yAudio, soundcloud as sAudio } from "./resolvers/audio.js";
import { youtube as yName, soundcloud as sName, deezer as dName} from "./resolvers/name.js";
import { youtube as yPager, soundcloud as sPager } from "./resolvers/pagers.js";
import { base as playlist } from "./resolvers/playlist.js";
import { base as song } from "./resolvers/song.js";

const addon: AddonInfo = {
    name: "Base",
    description: "Base addon for YADMB.",
    version: "1.0.0",
    credits: "tairasoul",
    data: {
        resolvers: {
            audio: [yAudio, sAudio],
            provider: [yName, sName, dName],
            pager: [yPager, sPager],
            playlist: [playlist],
            songData: [song]
        }
    },
    sources: [
        "https://github.com/tairasoul/YADMB/tree/main/addons/base"
    ]
}

export default addon;
