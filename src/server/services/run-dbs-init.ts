import { dbManager } from "../db";

export async function runDbsInit() {
    await dbManager.init();
}
