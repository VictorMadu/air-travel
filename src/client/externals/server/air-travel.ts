import axios, { AxiosResponse } from "axios";
import memoize from "lodash/memoize";

// TODO: For all get request coming from server as page loads, pass data from server to html pages using SSR

export function getWeatherDetailsFromUserLocation() {
    return makeServerCall<WeatherDetailsFromUserLocationRes>({
        subRoute: "/weather",
        method: "GET",
        params: { country: "105.112.213.109" },
    }).then(({ data }) => {
        const w = data.weather;
        return {
            degreeInCelsius: w.degree_in_celsius,
            degreeInFarenheit: w.degree_in_farenheit,
            humidity: w.humdity,
            weatherType: w.weather_type,
            weatherIcon: w.weather_icon,
            region: w.region,
            country: w.country,
            lat: w.lat,
            long: w.long,
        };
    });
}

export function calculateDistanceBtw(fromAiportID: string, toAirportID: string) {
    return makeServerCall<CalculateDistanceBtwRes>({
        subRoute: "/airport/calculate-distance",
        method: "GET",
        params: {
            from_airport: fromAiportID,
            to_airport: toAirportID,
        },
    }).then(({ data }) => data.distance);
}

export function getAirportsAround({
    location,
    batch = 30,
    offset = 0,
}: {
    location: string;
    batch?: number;
    offset?: number;
}) {
    return makeServerCall<GetAirportsAroundRes, Pagination>({
        subRoute: "/airport",
        method: "GET",
        params: { country: location, offset, batch },
    }).then(({ data, pagination }) => ({ airports: data.airports, pagination }));
}

export function placeTravelOrder(fromAiportID: string, toAirportID: string) {
    return makeServerCall<PlacedTravelOrderRes>({
        subRoute: `/airport/place-order`,
        method: "POST",
        data: {
            from_airport: fromAiportID,
            to_airport: toAirportID,
        },
    }).then(({ data }) => data.order_detail);
}

export function updatePaymentStatus<T extends {}>(orderId: string) {
    return makeServerCall({
        subRoute: `/airport/update-payment-status`,
        method: "POST",
        data: {
            id: orderId,
        },
    }).then(() => true);
}

export function fetchOrderDetail<T extends {}>(orderId: string) {
    return makeServerCall<FetchOrderDetail>({
        subRoute: `/airport/get-order-detail`,
        method: "GET",
        params: {
            id: orderId,
        },
    }).then(({ data }) => data.order_detail);
}

function makeServerCall<T extends {}, P extends Pagination | undefined = undefined>({
    subRoute,
    method,
    headers,
    data,
    params,
}: RequestConfig) {
    const baseUrl = (<WindowWithServerUrl>window).__SERVER_BASE_URL__.toString();
    return axios({
        url: `${baseUrl}${subRoute}`,
        method,
        params,
        data,
        headers: {
            ...headers,
            "Content-Type": "application/json",
        },
    }).then((response: AxiosResponse<APIRes<T, P>>) => {
        if (response.status > 399) return Promise.reject(response.data.msg);
        return { data: response.data.data, pagination: response.data.pagination };
    });
}

type WindowWithServerUrl = typeof window & { __SERVER_BASE_URL__: string };

type APIRes<T extends {}, P extends Pagination | undefined> = {
    status: boolean;
    msg: string;
    data: T;
    pagination: P;
};

interface Pagination {
    offset: number;
    batch: number;
}

interface RequestConfig {
    subRoute: string;
    method: "GET" | "POST";
    headers?: Record<string, string>;
    data?: {};
    params?: {};
}

export interface WeatherDetailsFromUserLocationRes {
    weather: {
        degree_in_celsius: number;
        degree_in_farenheit: number;
        humdity: number;
        weather_type: string;
        region: string;
        country: string;
        lat: number;
        long: number;
        weather_icon: string;
    };
}

export interface CalculateDistanceBtwRes {
    distance: number;
}

export interface GetAirportsAroundRes {
    airports: { id: string; name: string; score: number }[];
    pagination: { offset: number; batch: number };
}

export interface PlacedTravelOrderRes {
    order_detail: OrderDetail;
}

export interface FetchOrderDetail {
    order_detail: OrderDetail;
}

interface OrderDetail {
    id: string;
    from_airport_id: string;
    from_airport: string;
    from_country: string;
    to_airport_id: string;
    to_airport: string;
    to_country: string;
    total: string;
    payment_id: string;
    status: "failed" | "paid";
    payment_url: string;
}
