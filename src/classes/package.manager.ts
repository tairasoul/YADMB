import { exec } from "child_process";
import path from "path";
import { __dirname } from "../bot.js";
import fs from "fs";

export type managerDefs = {
    install: string;
    uninstall: string;
}

export default class PackageManager {
    private managerDefs: managerDefs;

    constructor(defs: managerDefs) {
        this.managerDefs = defs;
    }

    async getPackage(_package: string) {
        return new Promise<void>((resolve, reject) => {
            exec(`${this.managerDefs.install} ${_package}`, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    async removePackage(_package: string) {
        return new Promise<void>((resolve, reject) => {
            exec(`${this.managerDefs.uninstall} ${_package}`, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    isPackageInstalled(_package: string) {
        const topDir = path.dirname(__dirname);
        const nodeModules = path.join(topDir, "node_modules");
        // don't know what yarn adds that isnt in the node_modules directory traditionally
        const exclude = [".bin", ".pnpm", ".modules.yaml"];
        const list = fs.readdirSync(nodeModules).filter((v) => !exclude.some((b) => v.endsWith(b)));
        return list;
        /*return new Promise<boolean>((resolve, reject) => {
            exec(`${this.managerDefs.list}`, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                const installedPackages = stdout
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .filter(line => line.startsWith("├──") || line.startsWith("+--") || line.startsWith("`--"))
                    .map(line => line.replace(/^├──/, '').replace(/^\+--/, '').replace(/^\`--/, '').trim());

                const isInstalled = installedPackages.some(line => {
                    const packageName = line.split('@')[0].trim();
                    return packageName === _package;
                });

                resolve(isInstalled);
            });
        });*/
    }
}
