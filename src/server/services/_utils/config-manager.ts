import { Config } from "../../config";

export class ConfigManager {
    constructor(private config: Config) {}

    getUrl() {
        return `http://${this.config.host}:${this.config.port}`;
    }
}
