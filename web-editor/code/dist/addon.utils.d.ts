import { AddonInfo, WebResolver } from "./types";
export default class AddonUtils {
    info: AddonInfo[];
    constructor(info: AddonInfo[]);
    getAvailableResolvers(url: string): Promise<WebResolver[]>;
}
