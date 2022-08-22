import {
    airportsTable,
    dbManager,
    mySQLDistanceInKM,
    mySQLInDataSanitizer,
    ordersTable,
} from "../../db";
import { locationInfoExternalService } from "../location-info-external";
import { paymentExternalService } from "../payment-external";
import AirportRepository from "./airport.repository";
import AirportService from "./airport.service";

const airportRepository = new AirportRepository(
    dbManager,
    mySQLInDataSanitizer,
    airportsTable,
    ordersTable,
    mySQLDistanceInKM
);

export const airportService = new AirportService(
    airportRepository,
    locationInfoExternalService,
    paymentExternalService
);
