import fs from "fs";
export default class addonLoader {
    addonPath;
    _client;
    addons = [];
    constructor(addonPath, client) {
        this.addonPath = addonPath;
        this._client = client;
    }
    async readAddons() {
        for (const addon of fs.readdirSync(this.addonPath)) {
            console.log(`reading addon ${addon}`);
            if (fs.statSync(`${this.addonPath}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`);
                for (const subaddon of fs.readdirSync(`${this.addonPath}/${addon}`)) {
                    console.log(`reading addon ${addon}/${subaddon}`);
                    const addonInfo = await import(`file://${this.addonPath}/${addon}/${subaddon}`).then(m => m.default);
                    if (addonInfo instanceof Array) {
                        console.log(`addon ${subaddon} has multiple addons, iterating.`);
                        addonInfo.forEach((saddon) => {
                            console.log(`reading addon ${saddon.name} from ${subaddon}`);
                            this.addons.push(saddon);
                        });
                    }
                    else
                        this.addons.push(addonInfo);
                }
            }
            else {
                const addonInfo = await import(`file://${this.addonPath}/${addon}`).then(m => m.default);
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
