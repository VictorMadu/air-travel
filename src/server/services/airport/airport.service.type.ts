import { ChargeDetails } from "../payment-external";
import { GetOrderDetailsResults } from "./airport.repository.types";

export interface AirportService {
    getAirports(query: GetAirportQuery): Promise<{ id: string; name: string }[]>;
    getDistanceBtw(airportAUUID: string, airportBUUID: string): Promise<number>;
    placeOrder(airportAUUID: string, airportBUUID: string): Promise<GetOrderDetailsResults>;
    getOrdersDetailsBy(orderId: string): Promise<GetOrderDetailsResults>;
    updatePaymentStatus(chargeId: string): Promise<void>;
}

export interface Coordinate {
    lat: number;
    long: number;
}

export interface GetAirportQuery {
    countryOrLocationSearch: string;
    offset: number;
    batch: number;
}
