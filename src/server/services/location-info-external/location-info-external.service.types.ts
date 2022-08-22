export interface LocationInfoExternalService {
    getInfoUsing(ipAddressOrLatLongOrLocationName: string): Promise<CurrentInfo>;
    getPossibleLocationsInfoUsing(incompleteLocationSearch: string): Promise<SearchInfo>;
}

export type SearchInfo = {
    id: number;
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
}[];

export type CurrentInfo = {
    location: {
        name: string;
        region: string;
        country: string;
        lat: number;
        lon: number;
    };
    current: {
        temp_c: number;
        temp_f: number;
        condition: {
            text: string;
            icon: string;
            code: number;
        };
        humidity: number;
    };
};
