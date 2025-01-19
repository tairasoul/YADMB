export default class ProxyHandler {
    private proxies;
    private proxyIndex;
    constructor(cycleInterval: number, cycle: boolean);
    cycleProxy(): Promise<void>;
    ReadProxies(): void;
}
