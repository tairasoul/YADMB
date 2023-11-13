import fs from "fs";

export type resolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<string>;
}

export type patch = {
    prefix: {
        
    } | undefined;
    postfix: {

    } | undefined;
    name: string;
}

export type addon = {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    resolvers: resolver[];
    private?: boolean;
    type: "songResolver";
} | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    patches: patch[];
    private?: boolean;
    type: "patch";
}

export default class addonLoader {
    private addonPath: string;
    addons: addon[] = [];
    constructor(addonPath: string) {
        this.addonPath = addonPath;
    }

    async readAddons() {
        for (const addon of fs.readdirSync(this.addonPath)) {
            const addonInfo: addon = await import(`file://${this.addonPath}/${addon}`).then(m => m.default);
            this.addons.push(addonInfo);
        }
    }
}