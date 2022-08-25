import { Response } from "express";
import { OrWithArray } from "ts-util-types";

export function sendServerError(res: Response, error: any) {
    console.error("CRITICAL: Internal Server Error\n", error);
    return res.status(500).send({ status: false, msg: "Internal server error" });
}

export function send200(
    res: Response,
    data?: Data,
    pagination?: { offset: number; batch: number }
) {
    return res.status(200).send({
        status: true,
        msg: "Successful",
        data,
        pagination,
    });
}

export function send400(res: Response, msg: string) {
    return res.status(400).send({
        status: false,
        msg,
    });
}

export type Data = { [key: string]: OrWithArray<string | number | boolean | null | Data> };
