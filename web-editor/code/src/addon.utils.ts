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
    rawInfo: AddonInfo[] = [];
    fixedInfo: AddonInfo[] = [];
    ws: WebSocket;
    constructor(info: AddonInfo[], socket: WebSocket) {
        this.rawInfo = info.sort((a, b) => b.priority - a.priority);
        this.ws = socket;
    }

    async setupHashes() {
        for (const addon of this.rawInfo) {
            const resolvers: WebResolver[] = [];
            for (const resolver of addon.resolvers) {
                const av_hash = await sha256(`${addon.name}.${addon.version}.${resolver.name}.available`);
                const wb_hash = await sha256(`${addon.name}.${addon.version}.${resolver.name}.webResolver`);
                const newResolver: WebResolver = {
                    name: resolver.name,
                    description: resolver.description,
                    available: (url: string) => {
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
                    },
                    webResolver: (url: string) => {
                        return new Promise(async (resolve) => {
                            this.ws.send(JSON.stringify({request: "hashExecute", hash: wb_hash, params: [url]}));
                            const callback = (msg: any) => {
                                const json = JSON.parse(msg.data);
                                if (json.response === `hashExecute${wb_hash}`) {
                                    this.ws.removeEventListener("message", callback);
                                    resolve(json.data);
                                }
                            }
                            this.ws.addEventListener("message", callback);
                        })
                    }
                }
                resolvers.push(newResolver);
            }
            const newAddon: AddonInfo = {
                name: addon.name,
                description: addon.description,
                version: addon.version,
                private: addon.private,
                priority: addon.priority,
                resolvers
            }
            this.fixedInfo.push(newAddon);
        }
    }

    async getAvailableResolvers(url: string): Promise<WebResolver[]> {
        const resolvers: WebResolver[] = [];
        for (const addon of this.fixedInfo) {
            for (const resolver of addon.resolvers) {
                if (await resolver.available(url)) resolvers.push(resolver);
            }
        }
        return resolvers;
    }
}