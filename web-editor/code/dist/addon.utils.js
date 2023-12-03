async function sha256(message) {
    // Encode the message as a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    // Create a hash using SubtleCrypto
    const hash = await crypto.subtle.digest('SHA-256', data);
    // Convert the hash buffer to a string
    const hexString = Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    return hexString;
}
export default class AddonUtils {
    rawInfo = [];
    fixedInfo = [];
    url;
    constructor(info, url) {
        this.rawInfo = info.sort((a, b) => b.priority - a.priority);
        this.url = url;
        this.setupHashes();
    }
    async setupHashes() {
        for (const addon of this.rawInfo) {
            const resolvers = [];
            for (const resolver of addon.resolvers) {
                const av_hash = await sha256(`${addon.name}.${addon.version}.${resolver.name}.available`);
                const wb_hash = await sha256(`${addon.name}.${addon.version}.${resolver.name}.webResolver`);
                const newResolver = {
                    name: resolver.name,
                    description: resolver.description,
                    available: async (url) => {
                        const request = await fetch(`${this.url}/execute-hash/${av_hash}`, {
                            headers: {
                                "requestURL": url
                            }
                        });
                        const data = await request.json();
                        return data.data;
                    },
                    webResolver: async (url) => {
                        const request = await fetch(`${this.url}/execute-hash/${wb_hash}`, {
                            headers: {
                                "requestURL": url
                            }
                        });
                        const data = await request.json();
                        return data.data;
                    }
                };
                resolvers.push(newResolver);
            }
            const newAddon = {
                name: addon.name,
                description: addon.description,
                version: addon.version,
                private: addon.private,
                priority: addon.priority,
                resolvers
            };
            this.fixedInfo.push(newAddon);
        }
    }
    async getAvailableResolvers(url) {
        const resolvers = [];
        for (const addon of this.fixedInfo) {
            for (const resolver of addon.resolvers) {
                if (await resolver.available(url)) {
                    resolvers.push(resolver);
                }
            }
        }
        return resolvers;
    }
}
