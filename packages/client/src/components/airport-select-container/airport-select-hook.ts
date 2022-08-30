import { useRef, useState, useEffect, useMemo } from "react";
import { getAirportsAroundWithMemo } from "../../externals/server/air-travel";
import { neededDataGetter, NeededDataGetter } from "../../utils";
import { AirportDetail, State } from "./airport-select-container.types";
import { AirportFetcher, AirportSearch } from "./airport-select-container.actions";
import { AirportsMemo } from "./airport-select-container.memo";
import { AirportStateManager } from "./airport-select-container.state";

// TODO: Transform airports array to map airports for faster search
export function useAirportSelect({ onSelect }: AirportSelectCtx) {
    const { current: airportStateManager } = useRef(new AirportStateManager());
    const { current: airportFetcher } = useRef(
        new AirportFetcher({
            neededDataGetter: neededDataGetter as NeededDataGetter<AirportDetail>,
            dataAPIFetcher: getAirportsAroundWithMemo,
            throttleDelayTimeInMs: 1000,
            stateManager: airportStateManager,
            maxDataSize: 20,
        })
    );
    const { current: airportSearch } = useRef(
        new AirportSearch({ stateManager: airportStateManager })
    );

    const [state, setState] = useState<State>(airportStateManager.getState());

    useEffect(() => {
        airportFetcher.fetchInit();
        return airportStateManager.addListener(setState);
    }, [airportFetcher, airportStateManager]);

    useEffect(() => {
        if (state.selectedAirport === AirportStateManager.nullAirport) return;
        onSelect(state.selectedAirport);
    }, [onSelect, state.selectedAirport]);

    return {
        searchValue: state.searchValue,
        selectedAirport: state.selectedAirport,
        airportArr: state.airports,
        airports: airportsMemo.getAirports(state),
        handleSearchValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            airportSearch.updateSearchValue(e.target.value),
        handleSelectedAirport: (airportDetail: AirportDetail) =>
            airportSearch.updateSelectedAirport(airportDetail),
        airportFetcher,
    };
}

const airportsMemo = new AirportsMemo();

interface AirportSelectCtx {
    onSelect: (airport: AirportDetail) => void;
}
