import fs from "fs";
import { fileURLToPath } from 'url';
import path from "path";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
import { debugLog } from "./bot.js";
function isExcluded(filePath, exclusionList) {
    return exclusionList.some(exclusion => {
        if (exclusion.endsWith("*")) {
            const prefix = exclusion.slice(0, -1); // Remove the trailing *
            return filePath.startsWith(prefix);
        }
        else if (exclusion.startsWith("*")) {
            const suffix = exclusion.slice(1); // Remove the leading *
            return filePath.endsWith(suffix);
        }
        return filePath === exclusion; // Exact match
    });
}
export default class addonLoader {
    _client;
    addons = [];
    constructor(client) {
        this._client = client;
    }
    async readAddons() {
        for (const addon of fs.readdirSync(path.join(`${__dirname}`, "..", "addons"))) {
            console.log(`reading addon ${addon}`);
            // if addon is dir, re-call readAddons for addonPath/addon
            if (fs.statSync(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`);
                await this.readAddonFolder(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`);
            }
            // else, continue as normal with importing addon.
            else {
                const addonInfo = await import(`file://${path.join(`${__dirname}`, "..", "addons")}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`);
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    });
                }
                else {
                    this.addons.push(addonInfo);
                }
            }
            console.log(`addon ${addon} has been read`);
        }
    }
    async readAddonFolder(addonPath) {
        const exclusions = ["exclusions.json", "node_modules/*", "package.json", "package-lock.json"];
        if (fs.existsSync(`${addonPath}/exclusions.json`)) {
            const newExclusions = JSON.parse(fs.readFileSync(`${addonPath}/exclusions.json`, 'utf8'));
            for (const exclusion of newExclusions) {
                exclusions.push(exclusion.replace(/\//g, "\\"));
            }
        }
        debugLog(`exclusions for ${addonPath}: ${exclusions.join(" ")}`);
        for (const pathname of fs.readdirSync(addonPath, { recursive: true, encoding: "utf8" })) {
            if (fs.statSync(`${addonPath}/${pathname}`).isFile()) {
                if (!isExcluded(pathname, exclusions)) {
                    const addonInfo = await import(`file://${addonPath}/${pathname}`).then(m => m.default);
                    if (addonInfo instanceof Array) {
                        console.log(`addon ${path.basename(`${addonPath}/${pathname}`)} has multiple addons, iterating.`);
                        addonInfo.forEach((saddon) => {
                            console.log(`reading addon ${saddon.name} from ${pathname}`);
                            this.addons.push(saddon);
                        });
                    }
                    else {
                        this.addons.push(addonInfo);
                    }
                }
                else {
                    debugLog(`${pathname} is excluded, skipping.`);
                }
            }
        }
    }
    loadAddons() {
        for (const addon of this.addons) {
            console.log(`loading addon ${addon.name}`);
            this._client.addAddon(addon);
        }
    }
    registerAddons() {
        this._client.registerAddons();
    }
}
