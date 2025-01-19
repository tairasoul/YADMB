import { Proxy } from "../types/proxyTypes";
export default class ProxyHandler {
    private proxies;
    private proxyIndex;
    activeProxy: Proxy;
    constructor(cycleInterval: number, cycle: boolean);
    cycleProxy(): Promise<void>;
    ReadProxies(): void;
}
