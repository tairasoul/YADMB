export const youtube = {
    name: "youtube",
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/.*/, /https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url) {
        return "youtube";
    }
};
export const soundcloud = {
    name: "soundcloud",
    async available(url) {
        return [/https:\/\/soundcloud\.com\/.*/, /https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url) {
        return "soundcloud";
    }
};
export const deezer = {
    name: "deezer",
    async available(url) {
        return [/https:\/\/deezer\.(?:com|page\.link)\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    priority: 0,
    async resolve(url) {
        return "deezer";
    }
};
