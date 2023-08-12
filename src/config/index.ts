/* eslint-disable @typescript-eslint/member-ordering */
import { EnvOverride } from "@uwu-codes/utils";
import { parse } from "jsonc-parser";
import { access, readFile } from "node:fs/promises";

interface JSONConfig {
    token: string;
    webhook: {
        id: string;
        token: string;
    };
    githubToken: string;
}

const json = parse(await readFile(new URL("../../config.jsonc", import.meta.url), "utf8")) as JSONConfig;

const isDocker = await access("/.dockerenv").then(() => true, () => false) || await readFile("/proc/1/cgroup", "utf8").then(contents => contents.includes("docker"));
class Configuration {
    static get isDevelopment() {
        return !isDocker;
    }

    static get isDocker() {
        return isDocker;
    }

    static get dataDir() {
        return isDocker ? "/data" : new URL("../../data", import.meta.url).pathname;
    }

    static get token() {
        return json.token;
    }

    static get webhook() {
        return json.webhook;
    }

    static get githubToken() {
        return json.githubToken;
    }
}


const Config = EnvOverride("DATAMINING_", Configuration);
export default Config;
