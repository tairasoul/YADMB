import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const proxyPath = path.join(__dirname, "..", "..", "proxies.json");
export default class ProxyHandler {
    proxies = [];
    proxyIndex = 0;
    activeProxy;
    constructor(cycleInterval, cycle) {
        this.ReadProxies();
        const proxy = this.proxies[this.proxyIndex];
        this.activeProxy = proxy;
        if (cycle)
            setInterval(() => this.cycleProxy(), cycleInterval);
    }
    cycleProxy() {
        this.proxyIndex += 1;
        if (this.proxyIndex >= this.proxies.length)
            this.proxyIndex = 0;
    }
    ReadProxies() {
        const json = readFileSync(proxyPath, 'utf8');
        this.proxies = JSON.parse(json);
        if (this.proxies.length == 0)
            throw new Error("No proxies to use or cycle through. If proxies are enabled, please add proxies into proxies.json.");
    }
}
