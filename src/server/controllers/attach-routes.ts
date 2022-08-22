import airportControllers from "./airport.controller";
import webPagesControllers from "./web-pages.controller";
import { Attacher } from "./attach-routes.types";

export function attachControllersToRoute(attacher: Attacher) {
    attacher.attach("/", webPagesControllers);
    attacher.attach("/airport", airportControllers);
}
