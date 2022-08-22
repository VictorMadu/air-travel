import { LocationInfoExternalService } from "../location-info-external";
import { PaymentExternalService } from "../payment-external";
import AirportCSVManager from "./airport-csv-manager";
import { RowTraverser } from "./airport-csv-manager.types";
import AirportRepository from "./airport.repository";
import { AirportService, Coordinate, GetAirportQuery } from "./airport.service.type";
import { OrderGetBy } from "./order-get-by.enum";

export default class AirportServiceImpl implements AirportService {
    constructor(
        private airportRepository: AirportRepository,
        private locationInfoService: LocationInfoExternalService,
        private paymentService: PaymentExternalService
    ) {}

    async init() {
        const total = await this.airportRepository.getTotalData();
        const noData = total < 1;

        if (noData) await this.populateTable();
    }

    async getAirports(query: GetAirportQuery) {
        return this.locationInfoService
            .getPossibleLocationsInfoUsing(query.countryOrLocationSearch)
            .then((locationInfoService) => {
                console.log("locationInfoService", locationInfoService);
                return this.airportRepository.getAirportsSortedByScores(locationInfoService, query);
            })
            .catch(() => {
                return this.airportRepository.getUnSortedAirports(query);
            });
    }

    async getDistanceBtw(fromAirportUUID: string, toAirportUUID: string) {
        const fromAirportLatLong = await this.airportRepository.getLatLongFor(fromAirportUUID);
        const toAirportLatLong = await this.airportRepository.getLatLongFor(toAirportUUID);

        // TODO: Do all computation with latlong as string to preserve all values
        return this.getDistanceFromLatLongInKm(fromAirportLatLong, toAirportLatLong);
    }

    async placeOrder(fromAirportUUID: string, toAirportUUID: string) {
        const fromAirportLatLong = await this.airportRepository.getLatLongFor(fromAirportUUID);
        const toAirportLatLong = await this.airportRepository.getLatLongFor(toAirportUUID);
        // TODO: Do all computation with latlong as string to preserve all values
        const distance = this.getDistanceFromLatLongInKm(fromAirportLatLong, toAirportLatLong);

        const normalizedFromAirportLatLong = this.normalizeForLocationService(fromAirportLatLong);
        const normalizedToAirportLatLong = this.normalizeForLocationService(toAirportLatLong);

        const fromAirportLocationInfo = await this.locationInfoService.getInfoUsing(
            normalizedFromAirportLatLong
        );
        const toAirportLocationInfo = await this.locationInfoService.getInfoUsing(
            normalizedToAirportLatLong
        );
        const chargePerKM = 10;
        const total = chargePerKM * distance;

        const chargeDetails = await this.paymentService.createChargeAndGetDetails([
            {
                amountInCents: chargePerKM * total,
                productName: "Air Travel",
                description: ``,
            },
        ]);

        const paymentChargeIndex = 0;
        // TODO: Implement webhook to get notified when payment is success
        const isSaved = await this.airportRepository.saveOrderDetails({
            fromAirportUUID,
            fromCountry: fromAirportLocationInfo.location.country,
            toAirportUUID,
            toCountry: toAirportLocationInfo.location.country,
            total: chargeDetails.charges[paymentChargeIndex],
            stripeId: chargeDetails.id,
            status: chargeDetails.hasPaid,
        });

        // TODO: Implement current line stack for safe error like this or identify each location with a unique enum number that can be searched. Also use special logging
        if (!isSaved) {
            console.log("CRITICAL", chargeDetails, "not saved in database");
            console.log(
                "AT: src => server => services => airport => airport.service.ts -> line 83\n"
            );
        }

        return this.airportRepository.getOrdersDetailsBy({
            by: OrderGetBy.chargeId,
            value: chargeDetails.id,
        });
    }

    async updatePaymentStatus(orderId: string) {
        const orderDetails = await this.airportRepository.getOrdersDetailsBy({
            by: OrderGetBy.id,
            value: orderId,
        });

        const hasPaid = await this.paymentService.checkIfPaidUsing(orderDetails.payment_id);
        return this.airportRepository.updatePaymentStatus({ orderId: orderDetails.id, hasPaid });
    }

    async getOrdersDetailsBy(orderId: string) {
        return this.airportRepository.getOrdersDetailsBy({ by: OrderGetBy.id, value: orderId });
    }

    private async populateTable() {
        const airportCSVManager = new AirportCSVManager();

        await airportCSVManager.loadCSV();
        await this.airportRepository.populateTableFrom(<RowTraverser>airportCSVManager);
    }

    private getDistanceFromLatLongInKm(pointA: Coordinate, pointB: Coordinate) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(pointB.lat - pointA.lat);
        const dLon = this.deg2rad(pointB.long - pointA.long);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(pointA.lat)) *
                Math.cos(this.deg2rad(pointB.lat)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    private normalizeForLocationService(latLong: { lat: number; long: number }) {
        const lat = latLong.lat.toString();
        const long = latLong.long.toString();
        return lat + " " + long;
    }
}
