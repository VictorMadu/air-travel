import { AssetsService } from "./assets.service.type";

export default class AssetsServiceImpl implements AssetsService {
    private assetsRoot = this.path.join(this.appRoot.path, "assets");
    constructor(
        private appRoot: { path: string },
        private path: { join: (...args: string[]) => string }
    ) {}

    getClientHTMLFilePath() {
        return this.path.join(this.assetsRoot, "index.html");
    }
    getStaticDir(): string {
        return this.assetsRoot;
    }
}
