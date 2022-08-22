import { CurrentInfo } from "../location-info-external/location-info-external.service.types";

export interface WeatherService {
    getStatusFor(countryOrIpAddress: string): Promise<CurrentInfo>;
}
