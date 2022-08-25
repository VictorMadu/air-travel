import appRootPath from "app-root-path";
import path from "path";
import AssetsServiceImpl from "./asset.service";

export const assetsService = new AssetsServiceImpl(appRootPath, path);
