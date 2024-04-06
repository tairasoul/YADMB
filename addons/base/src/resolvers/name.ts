export const youtube = {
    name: "youtube",
    async available(url: string) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/.*/,/https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined
    },
    priority: 0,
    async resolve(url: any)  {
        return "youtube";
    }
}

export const soundcloud = {
    name: "soundcloud",
    async available(url: string) {
        return [/https:\/\/soundcloud\.com\/.*/,/https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined
    },
    priority: 0,
    async resolve(url: any) {
        return "soundcloud";
    }
}

export const deezer = {
    name: "deezer",
    async available(url: string) {
        return [/https:\/\/deezer\.(?:com|page\.link)\/.*/].find((reg) => reg.test(url)) != undefined
    },
    priority: 0,
    async resolve(url: any) {
        return "deezer"
    }
}