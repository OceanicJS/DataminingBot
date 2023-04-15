/* eslint-disable @typescript-eslint/member-ordering */
import LocalConfiguration from "./local.js";
import { EnvOverride } from "@uwu-codes/utils";
import { access, readFile } from "node:fs/promises";

const isDocker = await access("/.dockerenv").then(() => true, () => false) || await readFile("/proc/1/cgroup", "utf8").then(contents => contents.includes("docker"));
class Configuration extends LocalConfiguration {
    static get isDevelopment() {
        return process.env.NODE_ENV !== "production";
    }

    static get isDocker() {
        return isDocker;
    }

    static get dataDir() {
        return isDocker ? "/data" : new URL("../../data", import.meta.url).pathname;
    }

    static get postgresHost() {
        return this.isDocker ? "postgres" : "172.19.1.43";
    }

    static get postgresPort() {
        return 5432;
    }

    static get postgresUser() {
        return "yiffyapi";
    }

    static get postgresPassword() {
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined; // none
    }

    static get postgresDatabase() {
        return "yiffyapi";
    }
}


const Config = EnvOverride("DATAMINING_", Configuration);
export default Config;
