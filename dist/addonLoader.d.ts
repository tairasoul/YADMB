import MusicClient from "./client.js";
import { managerDefs } from "./package.manager.js";
export default class addonLoader {
    private _client;
    private addonPackages;
    private addons;
    constructor(client: MusicClient, managerDefs: managerDefs);
    readAddons(): Promise<void>;
    private readAddonFolder;
    private readAddonPackages;
    loadAddons(): void;
    registerAddons(): void;
}
