export type managerDefs = {
    install: string;
    uninstall: string;
};
export default class PackageManager {
    private managerDefs;
    constructor(defs: managerDefs);
    getPackage(_package: string): Promise<void>;
    removePackage(_package: string): Promise<void>;
    isPackageInstalled(_package: string): Promise<boolean>;
}
