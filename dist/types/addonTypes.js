import { ProxyAgent } from "undici";
import { canonicalDomain, Cookie, CookieJar } from "tough-cookie";
import { CookieClient } from "http-cookie-agent/undici";
import { SocksProxyAgent } from "socks-proxy-agent";
const convertSameSite = (sameSite) => {
    switch (sameSite) {
        case "strict":
            return "strict";
        case "lax":
            return "lax";
        case "no_restriction":
        case "unspecified":
        default:
            return "none";
    }
};
const convertCookie = (cookie) => cookie instanceof Cookie
    ? cookie
    : new Cookie({
        key: cookie.name,
        value: cookie.value,
        expires: typeof cookie.expirationDate === "number" ? new Date(cookie.expirationDate * 1000) : "Infinity",
        domain: canonicalDomain(cookie.domain),
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: convertSameSite(cookie.sameSite),
        hostOnly: cookie.hostOnly,
    });
const addCookies = (jar, cookies) => {
    if (!cookies || !Array.isArray(cookies)) {
        throw new Error("cookies must be an array");
    }
    if (!cookies.some(c => c.name === "SOCS")) {
        cookies.push({
            domain: ".youtube.com",
            hostOnly: false,
            httpOnly: false,
            name: "SOCS",
            path: "/",
            sameSite: "lax",
            secure: true,
            session: false,
            value: "CAI",
        });
    }
    for (const cookie of cookies) {
        jar.setCookieSync(convertCookie(cookie), "https://www.youtube.com");
    }
};
export function createSocksProxy(options, cookies = []) {
    if (!cookies)
        cookies = [];
    if (typeof options === "string")
        options = { uri: options };
    if (options.factory)
        throw new Error("Cannot use factory with createProxyAgent");
    const jar = new CookieJar();
    addCookies(jar, cookies);
    const proxyOptions = Object.assign({
        factory: (origin, opts) => {
            const o = Object.assign({ cookies: { jar } }, opts);
            return new CookieClient(origin, o);
        },
    }, options);
    const agent = new SocksProxyAgent(`socks4://${options.uri}`);
    const dispatcher = new ProxyAgent(`http://${options.uri}`);
    return { dispatcher, agent, jar, localAddress: options.localAddress };
}
;
