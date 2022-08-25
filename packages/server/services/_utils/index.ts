import config from "../../config";
import { AsyncFnCallRetrierImpl } from "./async-fn-call-retrier";
import { ConfigManager } from "./config-manager";
export type { AsyncFnCallRetrier } from "./async-fn-call-retrier.types";

export const asyncFnCallRetrier = new AsyncFnCallRetrierImpl<unknown>();
export const configManager = new ConfigManager(config);
