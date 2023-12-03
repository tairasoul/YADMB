import { AddonInfo } from "./types";
export default class addonLoader {
    addons: AddonInfo[];
    constructor();
    readAddons(): Promise<void>;
    readAddonFolder(addonPath: string): Promise<void>;
}
