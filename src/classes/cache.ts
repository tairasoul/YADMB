import pkg from "knex";
const { knex } = pkg;
import { debugLog } from "../bot.js";
import ms from "ms";
import path from "node:path";

type CacheInfo = {
    title: string;
    id: string;
    extra: {
        [info: string]: any;
    }
}

type InternalCached = {
    title: string;
    id: string;
    expires: number;
    extra: {
        [info: string]: any;
    };
}

type PreprocessCached = {
    title: string;
    expires: number;
    id: string;
    extra: string
}

export default class Cache {
    private database: pkg.Knex;
    private expiryOffset: number;
    private isInMemory = false;
    private databasePath: string;

    constructor(databasePath: string = "./cache.db", database_expiry_time: string = "3d") {
        this.expiryOffset = ms(database_expiry_time);
        this.databasePath = path.resolve(databasePath);
        if (databasePath == ":memory:") this.isInMemory = true;
        this.database = knex({
            client: "better-sqlite3",
            connection: {
                filename: databasePath
            },
            useNullAsDefault: true
        })
    }

    private async createTableIfNotExists(service: string) {
        const tableExists = await this.database.schema.hasTable(service);
        if (!tableExists) {
            await this.database.schema.createTable(service, (table) => {
                table.string('id').primary();
                table.string('title');
                table.integer('expires');
                table.json('extra');
            });
        }
    }

    async getCacheData() {
        const connection = await this.database.client.acquireConnection();
        return connection.serialize();
    }

    async getDatabaseName() {
        if (this.isInMemory) {
            return "in-memory-cache.db";
        }
        return path.basename(path.resolve(this.databasePath));
    }

    async isCached(service: string, id: string) {
        const query = await this.database<InternalCached>(service).where("id", id).first();
        return query !== undefined;
    }

    async isValid(service: string, id: string) {
        const query = await this.database<InternalCached>(service).where("id", id).first();
        const time = Date.now();
        if (query) {
            return time < query.expires;
        }
        return false;
    }

    async cache(service: string, info: CacheInfo) {
        debugLog(`caching ${info.id} for ${service}`);
        const processed: InternalCached = {
            title: info.title,
            id: info.id,
            extra: info.extra,
            expires: Date.now() + this.expiryOffset
        }
        await this.database<InternalCached>(service).insert(processed);
    }

    async uncache(service: string, id: string) {
        await this.database<InternalCached>(service).where("id", id).del();
    }

    async removeInvalidFromTable(service: string) {
        const time = Date.now();
        const res = await this.database<CacheInfo>(service).where("expires", "<", time).del();
        console.log(res)
    }

    async removeInvalidFromAllTables() {
        const tables = await this.getAllTables();
        for (const table of tables) {
            await this.removeInvalidFromTable(table);
        }
    }

    private async getAllTables() {
        const result = await this.database.raw<{name: string}[]>("SELECT name FROM sqlite_master WHERE type='table';");
        return result.map(row => row.name);
    }

    async getRaw(service: string, id: string) {
        await this.createTableIfNotExists(service);
        const cached = await this.isCached(service, id);
        if (cached) {
            const valid = await this.isValid(service, id);
            if (valid) {
                const info = (await this.database<PreprocessCached>(service).where("id", id).first()) as PreprocessCached;
                return info;
            }
            else {
                await this.uncache(service, id);
            }
        }
        return null;
    }

    async get(service: string, id: string) {
        const info = await this.getRaw(service, id);
        if (info) {
            const newInfo: CacheInfo = {
                title: info.title,
                id: info.id,
                extra: JSON.parse(info.extra)
            }
            return newInfo;
        }
        return null;
    }
}