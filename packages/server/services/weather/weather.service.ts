import {
    CurrentInfo,
    LocationInfoExternalService,
} from "../location-info-external/location-info-external.service.types";
import { WeatherService } from "./weather.service.types";

export class WeatherServiceImpl implements WeatherService {
    constructor(private locationInfoService: LocationInfoExternalService) {}

    getStatusFor(ipAddressOrCountry: string): Promise<CurrentInfo> {
        return this.locationInfoService.getInfoUsing(ipAddressOrCountry);
    }
}
