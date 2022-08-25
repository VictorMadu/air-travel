import path from "path";
import express from "express";
import appRoot from "app-root-path";
import airportControllers from "./airport.controller";
import webPagesControllers from "./web-pages.controller";
import weatherControllers from "./weather.controller";
import { Attacher } from "./attach-routes.types";

export function attachRoutes(attacher: Attacher) {
    attacher.attach("/airport", airportControllers);
    attacher.attach("/weather", weatherControllers);
    attacher.attach("/static", express.static(path.join(appRoot.path, "public")));
    attacher.attach("/", webPagesControllers);
}
