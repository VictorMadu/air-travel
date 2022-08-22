import { DbQuerier } from "./db-manager.types";
import { AirportsTable, OrdersTable } from "./db-tables";

export default class NonExistingTablesCreator {
    private dbQuerier!: DbQuerier;
    constructor(private t: AirportsTable, private o: OrdersTable) {}

    async createTables(dbQuerier: DbQuerier) {
        this.dbQuerier = dbQuerier;
        await this.createAirportsTable();
        await this.createOrdersTable();
    }

    private createAirportsTable() {
        const query = `
        CREATE TABLE IF NOT EXISTS ${this.t.NAME} (
            ${this.t.id} INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
            ${this.t.csvId} INT,
            ${this.t.ident} VARCHAR(15),
            ${this.t.type} VARCHAR(127),
            ${this.t.name} VARCHAR(127),
            ${this.t.latitudeDeg} DECIMAL(30, 27),
            ${this.t.longitudeDeg} DECIMAL(30, 27),
            ${this.t.elevationFt} INT,
            ${this.t.continent} VARCHAR(31),
            ${this.t.isoCountry} VARCHAR(7),
            ${this.t.isoRegion} VARCHAR(15),
            ${this.t.municipality} VARCHAR(63),
            ${this.t.scheduledService} VARCHAR(7),
            ${this.t.gpsCode} VARCHAR(63),
            ${this.t.iataCode} VARCHAR(63),
            ${this.t.localCode} VARCHAR(63),
            ${this.t.homeLink} VARCHAR(255),
            ${this.t.wikipediaLink} VARCHAR(511),
            ${this.t.keywords} VARCHAR(1023),
            ${this.t.uuid} BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())) UNIQUE,
            ${this.t.createdAt} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FULLTEXT KEY (${this.t.name} )
        )  ENGINE=INNODB;
        `;
        return this.dbQuerier.query({ getQuery: () => query });
    }

    private createOrdersTable() {
        const query = `
        CREATE TABLE IF NOT EXISTS ${this.o.NAME} (
            ${this.o.id} INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
            ${this.o.fromAirport} INT UNSIGNED NOT NULL,
            ${this.o.fromCountry} VARCHAR(127),
            ${this.o.toAirport} INT UNSIGNED NOT NULL,
            ${this.o.toCountry} VARCHAR(127),
            ${this.o.total} DECIMAL(14, 2) NOT NULL,
            ${this.o.stripeId} VARCHAR(127) NOT NULL,
            ${this.o.status} ENUM('paid', 'failed') NOT NULL,
            ${this.o.uuid} BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())) UNIQUE,
            ${this.o.createdAt} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_${this.o.fromAirport}
                FOREIGN KEY (${this.o.fromAirport}) 
                REFERENCES ${this.t.NAME}(${this.t.id}),

            CONSTRAINT fk_${this.o.toAirport}
                FOREIGN KEY (${this.o.toAirport}) 
                REFERENCES ${this.t.NAME}(${this.t.id})
        )  ENGINE=INNODB;
        `;
        return this.dbQuerier.query({ getQuery: () => query });
    }
}
