import { Request } from "express";

export async function parseReqBody(req: Request) {
    let rawBody = "";

    req.on("data", (buf: Buffer) => {
        rawBody += buf.toString("utf-8");
    });

    await new Promise<void>((resolve, reject) => {
        req.on("end", resolve).on("error", reject);
    });

    return JSON.parse(rawBody);
}
