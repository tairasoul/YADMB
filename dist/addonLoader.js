import fs from "fs";
export default class addonLoader {
    addonPath;
    addons = [];
    constructor(addonPath) {
        this.addonPath = addonPath;
    }
    async readAddons() {
        for (const addon of fs.readdirSync(this.addonPath)) {
            const addonInfo = await import(`file://${this.addonPath}/${addon}`).then(m => m.default);
            this.addons.push(addonInfo);
        }
    }
}
