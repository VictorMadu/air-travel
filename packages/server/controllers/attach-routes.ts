import express from "express";
import airportControllers from "./airport.controller";
import webPagesControllers from "./web-pages.controller";
import weatherControllers from "./weather.controller";
import { Attacher } from "./attach-routes.types";
import { assetsService } from "../services/assets";

export function attachRoutes(attacher: Attacher) {
    attacher.attach("/airport", airportControllers);
    attacher.attach("/weather", weatherControllers);
    attacher.attach("/", express.static(assetsService.getStaticDir()));
    attacher.attach("/", webPagesControllers);
}
