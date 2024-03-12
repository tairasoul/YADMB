type CacheInfo = {
    title: string;
    id: string;
    extra: {
        [info: string]: any;
    };
};
export default class Cache {
    private database;
    private expiryOffset;
    constructor(databasePath?: string, database_expiry_time?: string);
    private createTableIfNotExists;
    isCached(service: string, id: string): Promise<boolean>;
    isValid(service: string, id: string): Promise<boolean>;
    cache(service: string, info: CacheInfo): Promise<void>;
    uncache(service: string, id: string): Promise<void>;
    removeInvalid(service: string): Promise<void>;
    get(service: string, id: string): Promise<CacheInfo | null>;
}
export {};
