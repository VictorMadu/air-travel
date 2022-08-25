import { MySQLValue } from "./mysql-value"; // TODO: Export interface from a  index file for types and not class. Do this for all. All instance should be in camelCase and interfaces/types Capitialized, classes hidden
import { QueryCreator } from "./db-manager.types";
import { MySQLInDataSanitizer } from "./mysql-indata-sanitizer.types";

export default class MySQLDistanceInKM {
    createQueryCreator(locationQueryInfo: LocationQueryInfo) {
        return new MySQLDistanceInKMInKMQueryCreator(locationQueryInfo);
    }
}

class MySQLDistanceInKMInKMQueryCreator implements QueryCreator {
    constructor(private queryInfo: LocationQueryInfo) {}

    getQuery() {
        const latA = this.queryInfo.pointA.lat;
        const longA = this.queryInfo.pointA.long;
        const latB = this.queryInfo.pointB.lat;
        const longB = this.queryInfo.pointB.long;

        return `111.111 *
        DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latA}))
             * COS(RADIANS(${latB}))
             * COS(RADIANS(${longA} - ${longB}))
             + SIN(RADIANS(${latA}))
             * SIN(RADIANS(${latB})))))`;
    }
}

interface LocationQueryInfo {
    pointA: { lat: string; long: string };
    pointB: { lat: string; long: string };
}
