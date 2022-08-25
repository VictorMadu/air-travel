import express from "express";
import { weatherService } from "../services/weather";
import { send200, send400, sendServerError } from "./res-send-fns";

const router = express.Router();

// TODO: Turn to class and decouple the dependencies for easy testing
router.get("/", (req, res) => {
    // TODO: Remove hard-encoded ip address THIS IS FOR TEST
    const ipOrCountry = <string | undefined>(req.query.country || req.socket.remoteAddress);

    if (!ipOrCountry)
        return send400(
            res,
            "Please make your IP Address available or at least provide country as a query"
        );

    weatherService
        .getStatusFor(ipOrCountry)
        .then((locationInfo) => {
            const weatherData = {
                degree_in_celsius: locationInfo.current.temp_c,
                degree_in_farenheit: locationInfo.current.temp_f,
                humdity: locationInfo.current.humidity,
                weather_type: locationInfo.current.condition.text,
                region: locationInfo.location.region,
                country: locationInfo.location.country,
                lat: locationInfo.location.lat,
                long: locationInfo.location.lon,
                weather_icon: locationInfo.current.condition.icon,
            };
            send200(res, { weather: weatherData });
        })
        .catch((err) => {
            sendServerError(res, err);
        });
});

export default router;
