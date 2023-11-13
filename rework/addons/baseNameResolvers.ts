import { addon } from "../addonLoader.js";

const TestAddon: addon = {
    name: "Base Resolvers",
    description: "The base resolvers for DMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "songResolver",
    resolvers: [
        {
            name: "youtube",
            regexMatches: [
                /https:\/\/*.youtube.com\/watch\?v=*/,
                /https:\/\/youtu.be\/watch\?v=*/
            ],
            async resolve(url)  {
                if (this.regexMatches.find((reg) => reg.test(url)))
                return "youtube";
            }
        },
        {
            name: "soundcloud",
            regexMatches: [
                /https:\/\/soundcloud.com\/*/,
                /https:\/\/on.soundcloud.com\/*/
            ],
            async resolve(url) {
                if (this.regexMatches.find((reg) => reg.test(url)))
                return "soundcloud";
            }
        },
        {
            name: "deezer",
            regexMatches: [
                /https:\/\/deezer.[com|.page.link]\/*/
            ],
            async resolve(url) {
                if (this.regexMatches.find((reg) => reg.test(url)))
                return "deezer"
            }
        },
        {
            name: "spotify",
            regexMatches: [
                /https:\/\/open.spotify.com\/track\/*/
            ],
            async resolve(url) {
                if (this.regexMatches.find((reg) => reg.test(url)))
                return "spotify";
            }
        }
    ]
}

export default TestAddon;