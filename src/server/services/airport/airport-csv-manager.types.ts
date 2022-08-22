export interface RowTraverser {
    getRow(rowNo: number): CSVRow;
    getTotalRows(): number;
}

export interface CSVManager {
    loadCSV(): Promise<this>;
    getHeads(): string[];
}

export type CSVRow = [
    Id,
    Ident,
    Type,
    Name,
    LatitudeDeg,
    LongitudeDeg,
    ElevationFt,
    Continent,
    IsoCountry,
    IsoRegion,
    Municipality,
    ScheduledService,
    GPSCode,
    IataCode,
    LocalCode,
    HomeLink,
    WikipediaLink,
    Keywords
];

type Id = number;
type Ident = string;
type Type = string;
type Name = string;
type LatitudeDeg = number; // TODO: When reading CSV File, dont not parse number and boolean, obtain as string to perserve full value. Then replace all number and boolean here to string
type LongitudeDeg = number;
type ElevationFt = number;
type Continent = string;
type IsoCountry = string;
type IsoRegion = string;
type Municipality = string;
type ScheduledService = string;
type GPSCode = string;
type IataCode = string;
type LocalCode = string;
type HomeLink = string;
type WikipediaLink = string;
type Keywords = string;
