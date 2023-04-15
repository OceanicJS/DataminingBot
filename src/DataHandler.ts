import Config from "./config/index.js";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";

if (!await access(Config.dataDir).then(() => true, () => false)) {
    await mkdir(Config.dataDir, { recursive: true });
}

let cacheTimeout: NodeJS.Timeout | undefined;
export default class DataHandler {
    private static _cache: Array<number> | undefined;
    static async get() {
        if (cacheTimeout && this._cache) {
            return this._cache;
        }

        if (!await access(`${Config.dataDir}/cache.json`).then(() => true, () => false)) {
            await writeFile(`${Config.dataDir}/cache.json`, JSON.stringify([]));
            return [];
        }

        if (cacheTimeout) {
            clearTimeout(cacheTimeout);
        }
        cacheTimeout = setTimeout(() => {
            this._cache = undefined;
            cacheTimeout = undefined;
        }, 10_000);

        return (this._cache = JSON.parse(await readFile(`${Config.dataDir}/cache.json`, "utf8")) as Array<number>);
    }

    static async has(comment: number) {
        const comments = await this.get();
        return comments.includes(comment);
    }

    static async write(comments: Array<number>) {
        await writeFile(`${Config.dataDir}/cache.json`, JSON.stringify(comments));
        this._cache = comments;
        if (cacheTimeout) {
            clearTimeout(cacheTimeout);
        }
        cacheTimeout = setTimeout(() => {
            this._cache = undefined;
            cacheTimeout = undefined;
        }, 10_000);
    }
}
