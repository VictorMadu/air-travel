import axios from "axios";
import { AsyncFnCallRetrier } from "../_utils";
import {
    CurrentInfo,
    LocationInfoExternalService,
    SearchInfo,
} from "./location-info-external.service.types";

export class LocationInfoExternalServiceImpl implements LocationInfoExternalService {
    private baseUrl = "http://api.weatherapi.com/v1";
    private maxNoOfRetries = 1;

    constructor(
        private fnCallRetrier: AsyncFnCallRetrier<any>,
        private config: { weatherServiceAPIKey: string }
    ) {}

    async getInfoUsing(ipAddressOrLatLongOrLocationName: string) {
        if (this.isIpAddressLocalhost(ipAddressOrLatLongOrLocationName))
            return Promise.reject(null);
        const getData = () =>
            this.getData<CurrentInfo>("current.json", ipAddressOrLatLongOrLocationName);
        const data = await this.runWithRetries(getData);
        data.current.condition.icon = data.current.condition.icon.replace(/^\/\//, "");
        return data;
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

    private isIpAddressLocalhost(ipAddress: string) {
        return ipAddress === "127.0.0.1" || ipAddress === "::1";
    }
}
