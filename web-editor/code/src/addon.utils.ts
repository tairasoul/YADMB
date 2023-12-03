import { AddonInfo, WebResolver } from "./types";

async function sha256(message: string) {
    // Encode the message as a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
  
    // Create a hash using SubtleCrypto
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
    // Convert the hash buffer to a string
    const hashString = Array.from(new Uint8Array(hashBuffer))
      .map(byte => String.fromCharCode(byte))
      .join('');
  
    return hashString;
}
export default class AddonUtils {
    info: AddonInfo[] = [];
    ws: WebSocket;
    constructor(info: AddonInfo[], socket: WebSocket) {
        this.info = info.sort((a, b) => b.priority - a.priority);
        this.ws = socket;
    }

    async setupHashes() {
        for (const addon of this.info) {
            for (const resolver of addon.resolvers) {
                const av_hash = await sha256(`${addon.name}.${resolver.name}.available`);
                resolver.available = (url: string) => {
                    return new Promise(async (resolve) => {
                        this.ws.send(JSON.stringify({request: "hashExecute", hash: av_hash, params: [url]}));
                        const callback = (msg: any) => {
                            const json = JSON.parse(msg.data);
                            if (json.response === `hashExecute${av_hash}`) {
                                this.ws.removeEventListener("message", callback);
                                resolve(json.data);
                            }
                        }
                        this.ws.addEventListener("message", callback)
                    })
                }
                const wb_hash = await sha256(`${addon.name}.${resolver.name}.webResolver`)
                resolver.webResolver = (url: string) => {
                    return new Promise(async (resolve) => {
                        this.ws.send(JSON.stringify({request: "hashExecute", hash: wb_hash, params: [url]}));

                    })
                }
            }
        }
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