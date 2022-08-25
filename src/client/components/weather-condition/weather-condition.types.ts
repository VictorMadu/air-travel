export enum DegreeType {
    celsius,
    farenheit,
}

export interface WeatherDetails {
    degreeInCelsius: number;
    degreeInFarenheit: number;
    weatherType: string;
    humidity: number;
    region: string;
    country: string;
    lat: number;
    long: number;
    weatherIcon: string;
}

export interface WeatherOption {
    degreeTypeToShow: DegreeType;
}
