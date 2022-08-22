import config from "../config";
import DbManager from "./db-manager";
import { AirportsTable, OrdersTable } from "./db-tables";
import MySQLDistanceInKM from "./mysql-distance-query-creator";
import MySQLInDataSanitizerImpl from "./mysql-indata-sanitizer";
import NonExistingTablesCreator from "./mysql-non-existing-tables-creator";
import { MySQLValue } from "./mysql-value";

export { AirportsTable } from "./db-tables";
export type {
    ResultSetHeader,
    QueryResult,
    DBInitializer,
    DbQuerier,
    QueryCreator,
    Result,
} from "./db-manager.types";
export type { MySQLInDataSanitizer } from "./mysql-indata-sanitizer.types";

export const airportsTable = new AirportsTable();
export const ordersTable = new OrdersTable();

const nonExistingTablesCreator = new NonExistingTablesCreator(airportsTable, ordersTable);

export const dbManager = new DbManager(config, nonExistingTablesCreator);
export const mySQLValue = new MySQLValue();
export const mySQLInDataSanitizer = new MySQLInDataSanitizerImpl(mySQLValue);
export const mySQLDistanceInKM = new MySQLDistanceInKM();
