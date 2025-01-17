import { managerDefs } from "./package.manager.js";
export type PackageList = {
    [key: string]: string[];
};
export default class AddonPackages {
    private manager;
    private installedPath;
    private list;
    private checked;
    constructor(managerDefs: managerDefs);
    saveList(): void;
    checkPackages(): Promise<void>;
    addPackage(dependent: string, pkg: string): Promise<void>;
    checkPackage(pkg: string): Promise<string[]>;
}
