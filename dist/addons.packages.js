import PackageManager from "./package.manager.js";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { debugLog } from "./bot.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
export default class AddonPackages {
    manager;
    installedPath = `${path.join(__dirname, "..")}/modules.json`;
    list;
    checked = [];
    constructor(managerDefs) {
        this.manager = new PackageManager(managerDefs);
        if (!fs.existsSync(this.installedPath)) {
            fs.writeFileSync(this.installedPath, JSON.stringify({}, undefined, 4));
        }
        this.list = JSON.parse(fs.readFileSync(this.installedPath, 'utf8'));
    }
    saveList() {
        fs.writeFileSync(this.installedPath, JSON.stringify(this.list, undefined, 4));
    }
    async checkPackages() {
        const packages = Object.keys(this.list);
        for (const pkg of packages) {
            debugLog(`checking package ${pkg}`);
            if (this.list[pkg].length <= 0 || !this.checked.includes(pkg)) {
                debugLog(`removing package ${pkg}`);
                await this.manager.removePackage(pkg);
                delete this.list[pkg];
                this.saveList();
            }
        }
    }
    async addPackage(dependent, pkg) {
        if (this.list[pkg] == undefined) {
            this.list[pkg] = [];
        }
        this.list[pkg].push(dependent);
        await this.manager.getPackage(pkg);
    }
    async checkPackage(pkg) {
        this.checked.push(pkg);
        return await this.manager.isPackageInstalled(pkg);
    }
}
