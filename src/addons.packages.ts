import PackageManager, { managerDefs } from "./package.manager.js";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { debugLog } from "./bot.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));

export type PackageList = {
    [key: string]: string[];
}

const packageExclusions = ["@discordjs/voice", "@distube/ytdl-core", "@oceanicjs/builders", "express", "humanize-duration", "js-base64", "libsodium-wrappers", "lzwcompress", "oceanic.js", "opusscript", "play-dl", "randomstring", "ws", "ytpl"];

export default class AddonPackages {
    private manager: PackageManager;
    private installedPath: string = `${path.join(__dirname, "..")}/modules.json`;
    private list: PackageList;
    private checked: string[] = [];

    constructor(managerDefs: managerDefs) {
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
            debugLog(`checking usage of package ${pkg}`);
            if ((this.list[pkg].length <= 0 || !this.checked.includes(pkg)) && !packageExclusions.includes(pkg)) {
                debugLog(`removing package ${pkg}`);
                await this.manager.removePackage(pkg);
                delete this.list[pkg];
                this.saveList();
            }
        }
    }

    async addPackage(dependent: string, pkg: string) {
        if (this.list[pkg] == undefined) {
            this.list[pkg] = [];
        }
        this.list[pkg].push(dependent);
        await this.manager.getPackage(pkg);
    }

    async checkPackage(pkg: string) {
        this.checked.push(pkg);
        return await this.manager.isPackageInstalled(pkg);
    }
}