import express, { Express } from "express";

export default function attachMiddleware(app: Express) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
}
