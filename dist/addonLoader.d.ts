import MusicClient from "./client.js";
export default class addonLoader {
    private _client;
    private addons;
    constructor(client: MusicClient);
    readAddons(): Promise<void>;
    private readAddonFolder;
    loadAddons(): void;
    registerAddons(): void;
}
