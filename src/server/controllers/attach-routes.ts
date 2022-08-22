import airportControllers from "./airport.controller";
import webPagesControllers from "./web-pages.controller";
import weatherControllers from "./weather.controller";
import { Attacher } from "./attach-routes.types";

export function attachControllersToRoute(attacher: Attacher) {
    attacher.attach("/", webPagesControllers);
    attacher.attach("/airport", airportControllers);
    attacher.attach("/weather", weatherControllers);
}
