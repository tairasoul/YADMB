import fs from "fs";
import { fileURLToPath } from 'url';
import MusicClient from "./client.js";
import path from "path";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
import { debugLog } from "./bot.js";
import { AddonInfo } from "./addonTypes.js";
import { managerDefs } from "./package.manager.js";
import AddonPackages from "./addons.packages.js";

function isExcluded(filePath: string, exclusionList: string[]) {
    return exclusionList.some(exclusion => {
        if (exclusion.endsWith("*")) {
            const prefix = exclusion.slice(0, -1); // Remove the trailing *
            return filePath.startsWith(prefix);
        } else if (exclusion.startsWith("*")) {
            const suffix = exclusion.slice(1); // Remove the leading *
            return filePath.endsWith(suffix);
        }
      return filePath === exclusion; // Exact match
    });
}

export default class addonLoader {
    private _client: MusicClient;
    private addonPackages: AddonPackages;
    private addons: AddonInfo[] = [];
    constructor(client: MusicClient, managerDefs: managerDefs) {
        this._client = client;
        this.addonPackages = new AddonPackages(managerDefs);
    }

    async readAddons() {
        for (const addon of fs.readdirSync(path.join(`${__dirname}`, "..", "addons"))) {
            console.log(`reading addon ${addon}`);
            // if addon is dir, re-call readAddons for addonPath/addon
            if (fs.statSync(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`)
                await this.readAddonFolder(`${path.join(`${__dirname}`, "..", "addons")}/${addon}`);
            }
            // else, continue as normal with importing addon.
            else {
                const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${path.join(`${__dirname}`, "..", "addons")}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`)
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    })
                }
                else {
                    this.addons.push(addonInfo);
                }
            }
            console.log(`addon ${addon} has been read`);
        }
        await this.addonPackages.checkPackages();
    }

    private async readAddonFolder(addonPath: string) {
        const exclusions: string[] = ["exclusions.json", "node_modules/*", "package.json", "package-lock.json", "pnpm-lock.yaml", "tsconfig.json", "packages.json"];
        if (fs.existsSync(`${addonPath}/exclusions.json`)) {
            const newExclusions = JSON.parse(fs.readFileSync(`${addonPath}/exclusions.json`, 'utf8'));
            for (const exclusion of newExclusions) {
                exclusions.push(exclusion.replace(/\//g, "\\"));
            }
        }
        await this.readAddonPackages(addonPath);
        debugLog(`exclusions for ${addonPath}: ${exclusions.join(" ")}`)
        for (const pathname of fs.readdirSync(addonPath, {recursive: true, encoding: "utf8"})) {
            if (fs.statSync(`${addonPath}/${pathname}`).isFile()) {
                if (!isExcluded(pathname, exclusions)) {
                    const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${addonPath}/${pathname}`).then(m => m.default);
                    if (addonInfo instanceof Array) {
                        console.log(`addon ${path.basename(`${addonPath}/${pathname}`)} has multiple addons, iterating.`)
                        addonInfo.forEach((saddon) => {
                            console.log(`reading addon ${saddon.name} from ${pathname}`);
                            this.addons.push(saddon);
                        })
                    }
                    else {
                        this.addons.push(addonInfo);
                    }
                }
                else {
                    debugLog(`${pathname} is excluded, skipping.`)
                }
            }
        }
    }

    private async readAddonPackages(addonPath: string) {
        if (fs.existsSync(`${addonPath}/packages.json`)) {
            console.log(`reading packages for ${path.basename(addonPath)}`);
            const packages: string[] = JSON.parse(fs.readFileSync(`${addonPath}/packages.json`, 'utf8'));
            for (const pkg of packages) {
                console.log(`checking package ${pkg}`);
                if (!await this.addonPackages.checkPackage(pkg)) {
                    console.log(`${pkg} is not installed, adding.`);
                    await this.addonPackages.addPackage(path.basename(addonPath), pkg);
                    this.addonPackages.saveList();
                }
                else {
                    console.log(`${pkg} is installed, skipping.`);
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