import { useEffect, useMemo, useRef, useState } from "react";
import { getAirportsAround } from "../../externals/server/air-travel";
import { AirportDetail, State } from "./dropdown-select.types";
import { takeLatest } from "../../utils/throttles";
import memoize from "../../utils/memoize";
import { useStateManager } from "../../hooks/use-state-manager";
import {
    InfiniteScrollManager,
    neededDataGetterWithMemo,
    NeededDataGetter,
    NeededDataGetterCtx,
} from "../../utils";
import { OrWithPromise } from "ts-util-types";

// const neededDataGetter = new NeededDataGetter<AirportDetail>();

const noOfItemsLeftBeforeAutoFetch = 5;

function createFetchPrevForInfiniteScroll(fetcher: AirportFetcher) {
    return (noOfItemsAboveView: number) => {
        if (noOfItemsAboveView < noOfItemsLeftBeforeAutoFetch) fetcher.fetchPrev(6);
    };
}

function createFetchAfterForInfiniteScroll(fetcher: AirportFetcher) {
    return (noOfItemsBeforeView: number) => {
        if (noOfItemsBeforeView < noOfItemsLeftBeforeAutoFetch) fetcher.fetchNext(6);
    };
}

export function useDropdownSelect(searchValue: string) {
    const infiniteParentRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<State>({
        airports: [],
        currOffset: 0,
        isFetching: false,
    });
    const airportDetails = state.airports;
    const fetcher = airPortFetcher.setCtx({
        state,
        setState,
        searchValue,
    });

    const infinitScrollManager = useMemo(() => {
        return new InfiniteScrollManager(
            createFetchAfterForInfiniteScroll(fetcher),
            createFetchPrevForInfiniteScroll(fetcher)
        );
    }, [fetcher]);

    useEffect(() => {
        const parentElm = infiniteParentRef.current;
        if (parentElm == null) return;

        infinitScrollManager.setContainer(parentElm);
    }, [infinitScrollManager]);

    useEffect(() => {
        infinitScrollManager.refresh();
    }, [airportDetails, infinitScrollManager]);

    useEffect(() => {
        fetcher.fetchInit(20);
    }, [fetcher, searchValue]);

    return {
        infiniteParentRef,
        infinitScrollManager,
        airportDetails,
    };
}

type FetchAiportsFn = (
    location: string,
    offset: number,
    batch: number
) => Promise<{
    airports: AirportDetail[];
}>;

// TODO: Write decorator for transformed state and dispatch

class AirportFetcher {
    private state!: State;
    private setState!: React.Dispatch<React.SetStateAction<State>>;
    private batch!: number;
    private searchValue!: string;
    private offset!: number;
    private currState!: State;
    private fetchedAirports!: AirportDetail[];
    private fetchAirports: () => OrWithPromise<void>;

    constructor(
        private neededDataGetter: NeededDataGetter<AirportDetail>,
        private apiFetcher: (ctx: {
            location: string;
            batch: number;
            offset: number;
        }) => Promise<{ airports: AirportDetail[] }>,
        private batchSize: number,
        private throttleTimeInMs: number
    ) {
        this.fetchAirports = this.createFetchAirportsFn();
    }

    setCtx(ctx: {
        state: State;
        setState: React.Dispatch<React.SetStateAction<State>>;
        searchValue: string;
    }) {
        this.state = ctx.state;
        this.setState = ctx.setState;
        this.searchValue = ctx.searchValue;
        return this;
    }

    fetchInit(batch: number) {
        console.log("Fetching Initial");
        this.batch = batch;
        this.offset = 0;
        this.fetchAirports();
    }

    fetchPrev(batch: number) {
        this.batch = batch;
        this.offset = Math.max(0, this.state.currOffset - this.state.airports.length);
        console.log("Fetching Prev", this.batch, this.offset);
        this.fetchAirports();
    }

    fetchNext(batch: number) {
        this.batch = batch;
        this.offset = this.state.currOffset + this.state.airports.length;
        console.log("Fetching Next", this.batch, this.offset);
        this.fetchAirports();
    }

    private createFetchAirportsFn() {
        const fetchAirportsMemo = this.createFetchAirportsMemo();

        const fetchAirportFn = () => {
            if (this.state.isFetching) return;

            this.setState((s) => ({ ...s, isFetching: true }));
            fetchAirportsMemo(this.searchValue, this.offset, this.batch).then(({ airports }) => {
                this.setState((s) => {
                    this.fetchedAirports = airports;
                    this.currState = s;

                    return this.getNewStateFromFetchedAirports();
                });
            });
        };

        return takeLatest(fetchAirportFn, this.throttleTimeInMs);
    }

    private getNewStateFromFetchedAirports(): State {
        if (!this.fetchedAirports.length) return this.currState;

        const ctx = this.getNeededDataGetterCtx();
        let airports: AirportDetail[];

        if (this.offset < this.currState.currOffset)
            airports = this.neededDataGetter.withFetchedAtTop(ctx);
        else airports = this.neededDataGetter.withFetchedAtBottom(ctx);

        return { ...this.currState, airports, currOffset: this.offset, isFetching: false };
    }

    private createFetchAirportsMemo(): FetchAiportsFn {
        return memoize((location: string, offset: number, batch: number) => {
            return this.apiFetcher({ location, offset, batch });
        }, this.batchSize);
    }

    private getNeededDataGetterCtx(): NeededDataGetterCtx<AirportDetail> {
        return {
            fetchedData: this.fetchedAirports,
            currData: this.currState.airports,
            batch: 20,
            getKey: (airport) => airport.id,
        };
    }
}

const airPortFetcher = new AirportFetcher(
    neededDataGetterWithMemo.getNewInstance(2),
    getAirportsAround,
    20,
    1000
);
