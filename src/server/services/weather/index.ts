export type { WeatherService } from "./weather.service.types";
import { locationInfoExternalService } from "../location-info-external";
import { WeatherServiceImpl } from "./weather.service";

export const weatherService = new WeatherServiceImpl(locationInfoExternalService);
