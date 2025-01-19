import tunnel from "global-tunnel-ng";
import { Proxy } from "../types/proxyTypes";
export const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
const proxyPath = path.join(__dirname, "..", "..", "proxies.json");

export default class ProxyHandler {
    private proxies: Proxy[] = [];
    private proxyIndex: number = 0;

    constructor(cycleInterval: number, cycle: boolean) {
        this.ReadProxies();
        if (cycle)
            setInterval(async () => await this.cycleProxy(), cycleInterval);
    }

    async cycleProxy() {
        this.proxyIndex += 1;
        if (this.proxyIndex >= this.proxies.length)
            this.proxyIndex = 0;
        const proxy = this.proxies[this.proxyIndex];
        tunnel.end();
        await new Promise<void>((resolve) => setTimeout(resolve, 5));;
        tunnel.initialize(
            {
                host: proxy.url,
                port: proxy.port,
                proxyAuth: proxy.auth,
                sockets: 100
            }
        );
    }

    ReadProxies() {
        const json = readFileSync(proxyPath, 'utf8');
        this.proxies = JSON.parse(json);
        if (this.proxies.length == 0)
            throw new Error("No proxies to use or cycle through. If proxies are enabled, please add proxies into proxies.json.")
        const proxy = this.proxies[this.proxyIndex];
        tunnel.initialize(
            {
                host: proxy.url,
                port: proxy.port,
                proxyAuth: proxy.auth,
                sockets: 100
            }
        );
    }
}