import fs from "fs";
export default class addonLoader {
    _client;
    addons = [];
    constructor(client) {
        this._client = client;
    }
    async readAddons(addonPath) {
        for (const addon of fs.readdirSync(addonPath)) {
            console.log(`reading addon ${addon}`);
            if (fs.statSync(`${addonPath}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`);
                await this.readAddons(`${addonPath}/${addon}`);
            }
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
