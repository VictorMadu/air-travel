import DbManager from "../../db/db-manager";
import { AirportsTable, QueryResult, MySQLInDataSanitizer, QueryCreator } from "../../db";
import { RowTraverser } from "./airport-csv-manager.types";
import MySQLDistanceInKM from "../../db/mysql-distance-query-creator";
import {
    AddNewOrderInData,
    AirportRepository,
    ChargeDetail,
    GetAirportResult,
    GetOrderDetailsResults,
    GetTotalCountQueryResult,
    LocationPointInfo,
    Pagination,
    PopluateAirportsResult,
} from "./airport.repository.types";
import { OrdersTable } from "../../db/db-tables";
import { OrderGetBy } from "./order-get-by.enum";
import { MySQLValue } from "../../db/mysql-value";

export default class AirportRepositoryImpl implements AirportRepository {
    constructor(
        private dbManager: DbManager,
        private sanitizer: MySQLInDataSanitizer,
        private airPortsTable: AirportsTable,
        private orderTable: OrdersTable,
        private mySQLDistanceInKM: MySQLDistanceInKM,
        private mySQLValue: MySQLValue
    ) {}

    async populateTableFrom(csvRowTraverser: RowTraverser) {
        const queryManager = new PopulateTableQueryManager(
            this.airPortsTable,
            this.sanitizer,
            csvRowTraverser
        );
        <PopluateAirportsResult>await this.query(queryManager);
    }

    async getTotalData() {
        const [[{ total }]] = <GetTotalCountQueryResult>(
            await this.query(new TotalDataQueryManager(this.airPortsTable))
        );
        return total;
    }

    async getAirportsSortedByScores(
        locationPointInfos: LocationPointInfo[],
        pagination: Pagination
    ) {
        const queryCreator = new GetAirportDataSortedByScoresQueryManager(
            this.airPortsTable,
            this.sanitizer,
            this.mySQLDistanceInKM,
            { locationPointInfos, pagination }
        );
        const queryResult = await this.query(queryCreator);

        const [result] = queryResult;
        return <GetAirportResult>result;
    }

    async getUnSortedAirports(pagination: Pagination) {
        const queryCreator = new GetUnsortedAirportDataQueryManager(
            this.airPortsTable,
            this.sanitizer,
            { pagination }
        );
        const result = await this.query(queryCreator);
        const [airports] = result;

        return <GetAirportResult>airports;
    }

    async getLatLongFor(airportUUID: string): Promise<{ lat: number; long: number }> {
        const queryCreator = new GetAirportLatLong(this.airPortsTable, this.sanitizer, {
            airportUUID,
        });
        const result = await this.query(queryCreator);
        const [[{ lat_deg, long_deg }]] = result;
        return { lat: +lat_deg, long: +long_deg };
    }

    async saveOrderDetails(inData: AddNewOrderInData) {
        const queryCreator = new AddNewOrderQueryCreator(
            this.airPortsTable,
            this.orderTable,
            this.sanitizer,
            inData
        );
        const [, insertedCount] = await this.query(queryCreator);
        return !!insertedCount;
    }

    async updatePaymentStatus(chargeDetail: ChargeDetail) {
        const queryCreator = new UpdatePaymentStatus(this.orderTable, this.sanitizer, chargeDetail);
        <Promise<void>>this.query(queryCreator);
    }

    async getOrdersDetailsBy(search: { by: OrderGetBy; value: string }) {
        const queryCreator = this.getOrdersDetailsByQueryCreators(search);
        const result = await (<Promise<[[GetOrderDetailsResults]]>>this.query(queryCreator));
        const [[details]] = result;

        return details;
    }

    private getOrdersDetailsByQueryCreators(search: { by: OrderGetBy; value: string }) {
        switch (search.by) {
            case OrderGetBy.chargeId:
                return new GetOrderDetailsByChargeId(
                    this.orderTable,
                    this.airPortsTable,
                    this.sanitizer,
                    {
                        chargeId: search.value,
                    }
                );

            case OrderGetBy.id:
            default:
                return new GetOrderDetailsById(
                    this.orderTable,
                    this.airPortsTable,
                    this.sanitizer,
                    {
                        id: search.value,
                    }
                );
        }
    }
    private query<T extends QueryResult>(queryCreator: QueryCreator) {
        return this.dbManager.query<T>(queryCreator);
    }
}

class PopulateTableQueryManager implements QueryCreator {
    constructor(
        private t: AirportsTable,
        private santizer: MySQLInDataSanitizer,
        private inData: RowTraverser
    ) {}

    getQuery() {
        return `
        INSERT INTO ${this.t.NAME} (
            ${this.t.id},
            ${this.t.ident},
            ${this.t.type},
            ${this.t.name},
            ${this.t.latitudeDeg},
            ${this.t.longitudeDeg},
            ${this.t.elevationFt},
            ${this.t.continent},
            ${this.t.isoCountry},
            ${this.t.isoRegion},
            ${this.t.municipality},
            ${this.t.scheduledService},
            ${this.t.gpsCode},
            ${this.t.iataCode},
            ${this.t.localCode},
            ${this.t.homeLink},
            ${this.t.wikipediaLink},
            ${this.t.keywords}
        ) VALUES ${this.getQueryValues()}
        `;
    }

    private getQueryValues() {
        const seperator = ",";
        let values = "";

        for (let rowNo = 0; rowNo < this.inData.getTotalRows(); rowNo++) {
            values += this.getQueryValueFor(rowNo) + seperator;
        }
        return values.slice(0, -seperator.length);
    }

    private getQueryValueFor(rowNo: number) {
        const rowData = this.inData.getRow(rowNo);
        const s = this.santizer;

        const rowValues = `(
            ${s.sanitizeNum(rowData[0])},
            ${s.sanitizeStr(rowData[1])},
            ${s.sanitizeStr(rowData[2])},
            ${s.sanitizeStr(rowData[3])},
            ${s.sanitizeNum(rowData[4])},
            ${s.sanitizeNum(rowData[5])},
            ${s.sanitizeNum(rowData[6])},
            ${s.sanitizeStr(rowData[7])},
            ${s.sanitizeStr(rowData[8])},
            ${s.sanitizeStr(rowData[9])},
            ${s.sanitizeStr(rowData[10])},
            ${s.sanitizeStr(rowData[11])},
            ${s.sanitizeStr(rowData[12])},
            ${s.sanitizeStr(rowData[13])},
            ${s.sanitizeStr(rowData[14])},
            ${s.sanitizeStr(rowData[15])},
            ${s.sanitizeStr(rowData[16])},
            ${s.sanitizeStr(rowData[17])}
        )`;
        return rowValues;
    }
}

class TotalDataQueryManager implements QueryCreator {
    constructor(private t: AirportsTable) {}
    getQuery() {
        return `SELECT COUNT(*) AS total FROM ${this.t.NAME}`;
    }
}

class GetAirportDataSortedByScoresQueryManager implements QueryCreator {
    constructor(
        private t: AirportsTable,
        private sanitizer: MySQLInDataSanitizer,
        private mySQLDistanceInKM: MySQLDistanceInKM,
        private inData: { locationPointInfos: LocationPointInfo[]; pagination: Pagination }
    ) {}

    getQuery() {
        const offset = this.sanitizer.sanitizeOffset(this.inData.pagination.offset);
        const batch = this.sanitizer.sanitizeBatch(this.inData.pagination.batch);

        return `
            SELECT 
                BIN_TO_UUID(${this.t.uuid}) id,
                ${this.t.name} name,
                ${this.getDistanceScore()} score
            FROM ${this.t.NAME}
            ORDER BY score
            LIMIT ${offset}, ${batch}`;
    }

    // Lower distance score is better, it indicates location of interest closeness to airport
    private getDistanceScore() {
        const adder = "+";
        const locationsLen = this.inData.locationPointInfos.length;
        let query = "";

        for (let i = 0; i < locationsLen; i++) {
            query += `(${this.getDistance(i)})` + adder;
        }
        return query.slice(0, -adder.length);
    }

    private getDistance(locationPointInfoIndex: number) {
        const locationPointInfo = this.inData.locationPointInfos[locationPointInfoIndex];
        const lat = this.sanitizer.sanitizeNum(locationPointInfo.lat);
        const long = this.sanitizer.sanitizeNum(locationPointInfo.lon);

        const mySQLQueryCreator = this.mySQLDistanceInKM.createQueryCreator({
            pointA: { lat, long },
            pointB: { lat: this.t.latitudeDeg, long: this.t.longitudeDeg },
        });
        return mySQLQueryCreator.getQuery();
    }
}

class GetUnsortedAirportDataQueryManager implements QueryCreator {
    constructor(
        private t: AirportsTable,
        private sanitizer: MySQLInDataSanitizer,
        private inData: { pagination: Pagination }
    ) {}

    getQuery() {
        const offset = this.sanitizer.sanitizeOffset(this.inData.pagination.offset);
        const batch = this.sanitizer.sanitizeBatch(this.inData.pagination.batch);

        return `
            SELECT 
                BIN_TO_UUID(${this.t.uuid}) id,
                ${this.t.name} name
            FROM ${this.t.NAME}
            LIMIT ${offset}, ${batch}`;
    }
}

class GetAirportLatLong implements QueryCreator {
    constructor(
        private t: AirportsTable,
        private sanitizer: MySQLInDataSanitizer,
        private inData: { airportUUID: string }
    ) {}

    getQuery() {
        const airPortUUID = this.sanitizer.sanitizeStr(this.inData.airportUUID);
        return `
        SELECT 
            ${this.t.latitudeDeg} lat_deg,
            ${this.t.longitudeDeg} long_deg
        FROM ${this.t.NAME} 
        WHERE BIN_TO_UUID(${this.t.uuid}) = ${airPortUUID}`;
    }
}

class AddNewOrderQueryCreator implements QueryCreator {
    constructor(
        private t: AirportsTable,
        private o: OrdersTable,
        private sanitizer: MySQLInDataSanitizer,
        private inData: AddNewOrderInData
    ) {}

    getQuery() {
        return `
        INSERT INTO ${this.o.NAME}
            (${this.o.fromAirport},
            ${this.o.fromCountry},
            ${this.o.toAirport},
            ${this.o.toCountry},
            ${this.o.total},
            ${this.o.stripeId},
            ${this.o.status})
        SELECT 
            (${this.getAirportIDUsing(this.inData.toAirportUUID)}),
            ${this.sanitizer.sanitizeStr(this.inData.fromCountry)},
            (${this.getAirportIDUsing(this.inData.toAirportUUID)}),
            ${this.sanitizer.sanitizeStr(this.inData.toCountry)},
            ${this.sanitizer.sanitizeStr(this.inData.total.toString())},
            ${this.sanitizer.sanitizeStr(this.inData.stripeId)},
        ${this.getStatus()}`;
    }

    getAirportIDUsing(inDataAirportUUID: string) {
        const airportUUID = this.sanitizer.sanitizeStr(inDataAirportUUID);
        return `
        SELECT ${this.t.id}
        FROM ${this.t.NAME}
        WHERE BIN_TO_UUID(${this.t.uuid}) = ${airportUUID}`;
    }

    getStatus() {
        const status = this.inData.status ? "paid" : "failed";
        return this.sanitizer.sanitizeStr(status);
    }
}

// TODO: Merge with GetOrderDetailsByChargeId
class GetOrderDetailsByChargeId implements QueryCreator {
    constructor(
        private o: OrdersTable,
        private t: AirportsTable,
        private sanitizer: MySQLInDataSanitizer,
        private inData: { chargeId: string }
    ) {}

    getQuery() {
        return `
        SELECT
            BIN_TO_UUID(o.${this.o.uuid}) id,
            BIN_TO_UUID(t1.${this.t.uuid}) from_airport_id,
            BIN_TO_UUID(t2.${this.t.uuid}) to_airport_id,
            t1.${this.t.name} from_airport,
            t2.${this.t.name} to_airport,
            o.${this.o.total} total,
            o.${this.o.stripeId} payment_id,
            o.${this.o.status} status
        FROM ${this.o.NAME} o
        LEFT JOIN ${this.t.NAME} t1
        ON 
            t1.${this.t.id} = ${this.o.fromAirport}
        LEFT JOIN ${this.t.NAME} t2
        ON 
            t2.${this.t.id} = ${this.o.toAirport}
        WHERE 
            o.${this.o.stripeId} = ${this.getStripeId()}
        LIMIT 1`;
    }

    getStripeId() {
        return this.sanitizer.sanitizeStr(this.inData.chargeId);
    }
}

class GetOrderDetailsById implements QueryCreator {
    constructor(
        private o: OrdersTable,
        private t: AirportsTable,
        private sanitizer: MySQLInDataSanitizer,
        private inData: { id: string }
    ) {}

    getQuery() {
        return `
        SELECT
            BIN_TO_UUID(o.${this.o.uuid}) id,
            BIN_TO_UUID(t1.${this.t.uuid}) from_airport_id,
            BIN_TO_UUID(t2.${this.t.uuid}) to_airport_id,
            t1.${this.t.name} from_airport,
            t2.${this.t.name} to_airport,
            o.${this.o.fromCountry} from_country,
            o.${this.o.toCountry} to_country,
            o.${this.o.total} total,
            o.${this.o.stripeId} payment_id,
            o.${this.o.status} status
        FROM ${this.o.NAME} o
        LEFT JOIN ${this.t.NAME} t1
        ON 
            t1.${this.t.id} = ${this.o.fromAirport}
        LEFT JOIN ${this.t.NAME} t2
        ON 
            t2.${this.t.id} = ${this.o.toAirport}
        WHERE 
            BIN_TO_UUID(o.${this.o.uuid}) = ${this.getId()}
        LIMIT 1`;
    }

    getId() {
        return this.sanitizer.sanitizeStr(this.inData.id);
    }
}

class UpdatePaymentStatus implements QueryCreator {
    constructor(
        private o: OrdersTable,
        private sanitizer: MySQLInDataSanitizer,
        private inData: ChargeDetail
    ) {}

    getQuery() {
        return `
        UPDATE ${this.o.NAME}
        SET
            ${this.o.status} = ${this.getStatus()} 
        WHERE 
        BIN_TO_UUID(${this.o.uuid}) = ${this.getOderId()}`;
    }

    getStatus() {
        const status = this.inData.hasPaid ? "paid" : "failed";
        return this.sanitizer.sanitizeStr(status);
    }

    getOderId() {
        return this.sanitizer.sanitizeStr(this.inData.orderId);
    }
}
