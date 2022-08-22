export class AirportsTable {
    NAME = "airports";
    id = "id";
    uuid = "uuid";
    csvId = "csv_id";
    type = "type";
    latitudeDeg = "latitude_deg";
    longitudeDeg = "longitude_deg";
    elevationFt = "elevation_ft";
    isoCountry = "iso_country";
    municipality = "municipality";
    gpsCode = "gps_code";
    localCode = "local_code";
    wikipediaLink = "wikipediaLink";
    ident = "ident";
    name = "name";
    continent = "continent";
    isoRegion = "iso_region";
    scheduledService = "scheduled_service";
    iataCode = "iata_code";
    homeLink = "home_link";
    keywords = "keywords";
    createdAt = "created_at";
}

export class OrdersTable {
    NAME = "orders";
    id = "id";
    fromAirport = "from_airport";
    fromCountry = "from_country";
    toAirport = "to_airport";
    toCountry = "to_country";
    total = "total";
    stripeId = "stripe_id";
    status = "status";
    uuid = "uuid";
    createdAt = "created_at";
}
