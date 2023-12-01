const addon = {
    name: "Base Name Resolvers",
    description: "The base name resolvers for YADMB.",
    credits: "tairasoul",
    version: "1.0.0",
    sources: [
        "https://github.com/tairasoul/YADMB/blob/main/rework/addons/base/baseNameResolvers.ts"
    ],
    type: "songResolver",
    resolvers: [
        {
            name: "youtube",
            async available(url) {
                return [/https:\/\/(?:music|www)\.youtube\.com\/.*/, /https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            priority: 0,
            async resolve(url) {
                return "youtube";
            }
        },
        {
            name: "soundcloud",
            async available(url) {
                return [/https:\/\/soundcloud\.com\/.*/, /https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            priority: 0,
            async resolve(url) {
                return "soundcloud";
            }
        },
        {
            name: "deezer",
            async available(url) {
                return [/https:\/\/deezer\.(?:com|page\.link)\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            priority: 0,
            async resolve(url) {
                return "deezer";
            }
        }
    ]
};
export default addon;
