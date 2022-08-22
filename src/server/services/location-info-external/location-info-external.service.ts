import axios from "axios";
import { AsyncFnCallRetrier } from "../_utils";
import {
    CurrentInfo,
    LocationInfoExternalService,
    SearchInfo,
} from "./location-info-external.service.types";

export class LocationInfoExternalServiceImpl implements LocationInfoExternalService {
    private baseUrl = "http://api.weatherapi.com/v1";
    private maxNoOfRetries = 10;

    constructor(
        private fnCallRetrier: AsyncFnCallRetrier<any>,
        private config: { weatherServiceAPIKey: string }
    ) {}

    async getInfoUsing(ipAddressOrLatLongOrLocationName: string) {
        const getData = () =>
            this.getData<CurrentInfo>("current.json", ipAddressOrLatLongOrLocationName);
        return this.runWithRetries(getData);
    }

    async getPossibleLocationsInfoUsing(incompleteLocationSearch: string) {
        const getData = () => this.getData<SearchInfo>("search.json", incompleteLocationSearch);
        return this.runWithRetries(getData);
    }

    private getData<T extends any>(jsonName: string, querySearch: string) {
        const url = `${this.baseUrl}/${jsonName}?key=${this.config.weatherServiceAPIKey}&q=${querySearch}`;
        return axios({
            method: "GET",
            url,
        }).then((response) => <T>response.data);
    }

    private runWithRetries<T extends any>(fn: () => Promise<T>) {
        return this.fnCallRetrier.createNewInstance(fn, this.maxNoOfRetries).run();
    }
}
