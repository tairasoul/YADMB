import { AddonInfo, WebResolver } from "./types";
export default class AddonUtils {
    rawInfo: AddonInfo[];
    fixedInfo: AddonInfo[];
    ws: WebSocket;
    constructor(info: AddonInfo[], socket: WebSocket);
    setupHashes(): Promise<void>;
    getAvailableResolvers(url: string): Promise<WebResolver[]>;
}
