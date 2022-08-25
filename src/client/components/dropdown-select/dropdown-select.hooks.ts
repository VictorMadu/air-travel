import { useEffect } from "react";
import { getAirportsAround } from "../../externals/server/air-travel";
import { AirportDetail, State } from "./dropdown-select.types";
import { takeLatest } from "../../throttles";
import memoize from "../../memoize";
import NeededDataGetter, { NeededDataCtx } from "../../needed-data-getter";
import { useImmuntable } from "../../hooks/use-immutable";
import { useStateManager } from "../../hooks/use-state-manager";

const neededDataGetter = new NeededDataGetter<AirportDetail>();

const initialState: State = {
    airports: [],
    currOffset: 0,
};

export function useDropdownSelect(searchValue: string, batch: number) {
    const stateManager = useStateManager<State>(initialState);
    const fetchAndUpdateState = useImmuntable(
        createAirportFetcher(stateManager, { throttleDelayTimeInMs: 1000 })
    );

    useEffect(() => {
        const fetchInitialAirports = () => fetchAndUpdateState(searchValue, 0, batch);
        fetchInitialAirports();
    }, [searchValue, fetchAndUpdateState, batch]);

    function fetch(offset: number) {
        console.log("OFFSET", offset);
        fetchAndUpdateState(searchValue, offset, batch);
    }

    function fetchPreviousAirports() {
        console.log("Fetching preevious airports");
        fetch(Math.max(0, stateManager.state.currOffset - stateManager.state.airports.length));
    }

    function fetchNextAirports() {
        console.log("Fetching next airports");
        fetch(stateManager.state.currOffset + stateManager.state.airports.length);
    }

    return {
        airportDetails: stateManager.state.airports,
        fetchPreviousAirports,
        fetchNextAirports,
    };
}

class Actions {
    constructor(private stateManager: StateManager<State>) {}
}

function createAirportFetcher(
    stateManager: StateManager<State>,
    ctx: { throttleDelayTimeInMs: number }
) {
    const fetchAndUpdateStateFn = takeLatest(fetchAndUpdateState, ctx.throttleDelayTimeInMs);

    function fetch(searchValue: string, offset: number, batch: number) {
        return fetchAndUpdateStateFn(<FetchAndGetUpdateStateCtx>{
            stateManager,
            searchValue,
            offset,
            batch,
        });
    }
    return fetch;
}

interface FetchAndGetUpdateStateCtx {
    searchValue: string;
    offset: number;
    batch: number;
    stateManager: StateManager<State>;
}

// TODO: Arrange memos and throttles
function createFetchAirportsMemo() {
    return memoize(function (location: string, offset: number, batch: number) {
        console.log("LOCATION", location);
        return getAirportsAround({ location, offset, batch });
    }, 2);
}

type AirportGetterFn = (ctx: NeededDataCtx<AirportDetail>) => AirportDetail[];

function createNeededAirportsMemo(getFn: AirportGetterFn) {
    return memoize(function (fetched: AirportDetail[], curr: AirportDetail[], batch: number) {
        return getFn({
            fetchedData: fetched,
            currData: curr,
            batch,
            getKey: (airport) => airport.id,
        });
    });
}

const fetchAirports = createFetchAirportsMemo();
function fetchAndUpdateState(ctx: FetchAndGetUpdateStateCtx) {
    console.log("FFFF fetchAndUpdateState");
    const state = ctx.stateManager.state;
    const setState = ctx.stateManager.setState;

    const withFetchedAtTop = createNeededAirportsMemo(function (ctx) {
        return neededDataGetter.withFetchedAtTop(ctx);
    });
    const withFetchedAtBottom = createNeededAirportsMemo(function (ctx) {
        return neededDataGetter.withFetchedAtBottom(ctx);
    });

    console.log(
        "getAirportsAroundMemo",
        "searchValue",
        ctx.searchValue,
        "offset",
        ctx.offset,
        "batch",
        ctx.batch
    );

    fetchAirports(ctx.searchValue, ctx.offset, ctx.batch).then(({ airports: fetchedAirports }) => {
        console.log("FETCH AIRPORT ", fetchedAirports);
        console.log("FETCH STATE", state);
        console.log("LENGTH ", fetchedAirports.length.toString());
        if (!fetchedAirports.length) return;

        if (ctx.offset < state.currOffset) {
            const airports = withFetchedAtTop(fetchedAirports, state.airports, ctx.batch);
            console.log("STATE UPDATE AT TOP ", airports);
            setState((s) => ({ ...s, airports, currOffset: ctx.offset }));
        } else {
            const airports = withFetchedAtBottom(fetchedAirports, state.airports, ctx.batch);
            console.log("STATE UPDATE AT BOTTOM ", airports);
            setState((s) => ({ ...s, airports, currOffset: ctx.offset }));
        }
    });
}

interface FetchAndGetUpdateStateCtx {
    searchValue: string;
    offset: number;
    initialState: State;
    currAirports: AirportDetail[];
    currOffset: number;
    batch: number;
    setState: (s: State) => void;
}

interface StateManager<T extends any> {
    state: T;
    setState: React.Dispatch<React.SetStateAction<T>>;
}
