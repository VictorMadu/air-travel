import memoize from "../../utils/memoize";
import { AirportDetail, State } from "./airport-select-container.types";

export class AirportsMemo {
    constructor() {
        this._getAirportsMap = memoize(this._getAirportsMap.bind(this), 2);
    }

    getAirports(state: State) {
        return this._getAirportsMap(state.airports);
    }

    private _getAirportsMap(airports: AirportDetail[]) {
        const airportMap = {} as Record<AirportDetail["id"], { name: AirportDetail["name"] }>;

        for (let i = 0; i < airports.length; i++) {
            const airport = airports[i];
            airportMap[airport.id] = { name: airport.name };
        }
        return airportMap;
    }
}
