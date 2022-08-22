import express from "express";
import { renderHtml } from "../../client";

const router = express.Router();

router.get("/", async (req, res, next) => {
    res.send(renderHtml(req));
});

export default router;
