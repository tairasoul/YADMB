import { AddonInfo } from "./types";
export default class addonLoader {
    addons: AddonInfo[];
    private addonsRead;
    constructor();
    readAddonsSync(): void;
    readAddons(): Promise<void>;
    readAddonFolder(addonPath: string): Promise<void>;
}
