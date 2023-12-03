import { AddonInfo, WebResolver } from "./types";

export default class AddonUtils {
    info: AddonInfo[] = [];
    constructor(info: AddonInfo[]) {
        this.info = info.sort((a, b) => b.priority - a.priority);
    }

    async getAvailableResolvers(url: string): Promise<WebResolver[]> {
        const resolvers: WebResolver[] = [];
        for (const addon of this.info) {
            for (const resolver of addon.resolvers) {
                if (await resolver.available(url)) resolvers.push(resolver);
            }
        }
        return resolvers;
    }
}