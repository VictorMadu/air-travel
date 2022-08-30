export interface State {
    searchValue: string;
    selectedAirport: AirportDetail;
    airports: AirportDetail[];
    currOffset: number;
    isFetching: boolean;
}

export interface AirportDetail {
    id: string;
    name: string;
}
