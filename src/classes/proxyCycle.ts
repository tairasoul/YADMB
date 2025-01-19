import { Proxy } from "../types/proxyTypes";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const proxyPath = path.join(__dirname, "..", "..", "proxies.json");

export default class ProxyHandler {
    private proxies: Proxy[] = [];
    private proxyIndex: number = 0;
    public activeProxy: Proxy;

    constructor(cycleInterval: number, cycle: boolean) {
        this.ReadProxies();
        const proxy = this.proxies[this.proxyIndex];
        this.activeProxy = proxy;
        if (cycle)
            setInterval(async () => await this.cycleProxy(), cycleInterval);
    }

    async cycleProxy() {
        this.proxyIndex += 1;
        if (this.proxyIndex >= this.proxies.length)
            this.proxyIndex = 0;
    }

    ReadProxies() {
        const json = readFileSync(proxyPath, 'utf8');
        this.proxies = JSON.parse(json);
        if (this.proxies.length == 0)
            throw new Error("No proxies to use or cycle through. If proxies are enabled, please add proxies into proxies.json.")
    }
}