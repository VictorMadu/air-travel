import { RowTraverser } from "./airport-csv-manager.types";
import { OrderGetBy } from "./order-get-by.enum";

export interface AirportRepository {
    populateTableFrom(csvRowTraverser: RowTraverser): Promise<void>;
    getTotalData(): Promise<number>;
    getAirportsSortedByScores(
        locationPointInfos: LocationPointInfo[],
        pagination: Pagination
    ): Promise<GetAirportResult>;
    getUnSortedAirports(pagination: Pagination): Promise<GetAirportResult>;
    getLatLongFor(airportUUID: string): Promise<{ lat: number; long: number }>;
    saveOrderDetails(inData: AddNewOrderInData): Promise<boolean>;
    updatePaymentStatus(chargeDetail: ChargeDetail): Promise<void>;
    getOrdersDetailsBy(search: { by: OrderGetBy; value: string }): Promise<GetOrderDetailsResults>;
}

export interface LocationPointInfo {
    lat: number;
    lon: number;
}

export interface Pagination {
    offset: number;
    batch: number;
}

export interface Pagination {
    offset: number;
    batch: number;
}
export type GetAirportQuery = { countryOrLocationSearch: string };
export type GetAirportResult = { id: string; name: string }[];

//  ================================= Query Result =============
// TODO: For each queryCreators, their return types should have the same name as them but 'Result' will be added
export type GetTotalCountQueryResult = [[{ total: number }], [{ total: number }]];

export type PopluateAirportsResult = [OtherHigherValue, TotalInserts];
type TotalInserts = number;
type OtherHigherValue = number;

export interface AddNewOrderInData {
    fromAirportUUID: string;
    fromCountry: string;
    toAirportUUID: string;
    toCountry: string;
    total: number;
    stripeId: string;
    status: boolean;
}

export interface ChargeDetail {
    orderId: string;
    hasPaid: boolean;
}

export interface GetOrderDetailsResults {
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
}
