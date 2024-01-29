import { AddonInfo } from "./types";
export default class addonLoader {
    addons: AddonInfo[];
    constructor();
    readAddons(): Promise<void>;
    private readAddonFolder;
}
