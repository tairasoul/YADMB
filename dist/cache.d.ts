type CacheInfo = {
    title: string;
    id: string;
    extra: {
        [info: string]: any;
    };
};
type PreprocessCached = {
    title: string;
    expires: number;
    id: string;
    extra: string;
};
export default class Cache {
    private database;
    private expiryOffset;
    private isInMemory;
    private databasePath;
    constructor(databasePath?: string, database_expiry_time?: string);
    private createTableIfNotExists;
    getCacheData(): Promise<any>;
    getDatabaseName(): Promise<string>;
    isCached(service: string, id: string): Promise<boolean>;
    isValid(service: string, id: string): Promise<boolean>;
    cache(service: string, info: CacheInfo): Promise<void>;
    uncache(service: string, id: string): Promise<void>;
    removeInvalidFromTable(service: string): Promise<void>;
    removeInvalidFromAllTables(): Promise<void>;
    private getAllTables;
    get(service: string, id: string): Promise<CacheInfo | null>;
    getRaw(service: string, id: string): Promise<PreprocessCached | null>;
}
export {};
