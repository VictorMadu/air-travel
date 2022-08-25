export interface SearchValueManager {
    onSelect: (airportId: string) => void;
}

export interface State {
    airports: AirportDetail[];
    currOffset: number;
}

export interface AirportDetail {
    id: string;
    name: string;
}
