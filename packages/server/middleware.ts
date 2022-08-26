import express, { Express } from "express";
import cors from "cors";

export default function attachMiddleware(app: Express) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
}
