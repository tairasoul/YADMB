import { AddonInfo, WebResolver } from "./types";
export default class AddonUtils {
    rawInfo: AddonInfo[];
    fixedInfo: AddonInfo[];
    url: string;
    constructor(info: AddonInfo[], url: string);
    setupHashes(): Promise<void>;
    getAvailableResolvers(url: string): Promise<WebResolver[]>;
}
