import { exec } from "child_process";
export default class PackageManager {
    managerDefs;
    constructor(defs) {
        this.managerDefs = defs;
    }
    async getPackage(_package) {
        return new Promise((resolve, reject) => {
            exec(`${this.managerDefs.install} ${_package}`, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    async removePackage(_package) {
        return new Promise((resolve, reject) => {
            exec(`${this.managerDefs.uninstall} ${_package}`, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    async isPackageInstalled(_package) {
        return new Promise((resolve, reject) => {
            exec(`npm ls`, (error, stdout) => {
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
        });
    }
}
