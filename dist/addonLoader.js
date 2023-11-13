import fs from "fs";
import path from "path";
export default class addonLoader {
    _client;
    addons = [];
    constructor(client) {
        this._client = client;
    }
    async readAddons(addonPath) {
        const exclusions = ["exclusions.json", "node_modules", "package.json", "package-lock.json"];
        if (fs.existsSync(`${addonPath}/exclusions.json`)) {
            const newExclusions = JSON.parse(fs.readFileSync(`${addonPath}/exclusions.json`, 'utf8'));
            for (const exclusion of newExclusions)
                exclusions.push(exclusion);
        }
        console.log(`exclusions found for ${path.basename(addonPath)}: ${exclusions.join(", ")}`);
        for (const addon of fs.readdirSync(addonPath)) {
            if (exclusions.includes(addon))
                continue;
            console.log(`reading addon ${addon}`);
            // if addon is dir, re-call readAddons for addonPath/addon
            if (fs.statSync(`${addonPath}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`);
                await this.readAddons(`${addonPath}/${addon}`);
            }
            // else, continue as normal with importing addon.
            else {
                const addonInfo = await import(`file://${addonPath}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`);
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    });
                }
                else
                    this.addons.push(addonInfo);
            }
            console.log(`addon ${addon} has been read`);
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
