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
            const addonInfo = await import(`file://${this.addonPath}/${addon}`).then(m => m.default);
            this.addons.push(addonInfo);
        }
    }
    loadAddons() {
        for (const addon of this.addons)
            this._client.addAddon(addon);
    }
    registerAddons() {
        this._client.registerAddons();
    }
}
