import { NeededDataGetter } from "../../utils";
import { takeLatest } from "../../utils/throttles";
import { AirportDetail } from "./airport-select-container.types";
import { AirportStateManager } from "./airport-select-container.state";

interface AirportSearchCtx {
    stateManager: AirportStateManager;
}

export class AirportSearch {
    private stateManager: AirportStateManager;

    constructor(ctx: AirportSearchCtx) {
        this.stateManager = ctx.stateManager;
    }

    updateSearchValue(searchValue: string) {
        this.stateManager.updateState((s) => ({ ...s, searchValue }));
    }
    updateSelectedAirport(selectedAirport: AirportDetail) {
        this.stateManager.updateState((s) => ({ ...s, selectedAirport }));
    }
}

interface AirportFetcherCtx {
    neededDataGetter: NeededDataGetter<AirportDetail>;
    dataAPIFetcher: (
        location: string,
        batch: number,
        offset: number
    ) => Promise<{
        airports: AirportDetail[];
    }>;
    throttleDelayTimeInMs: number;
    stateManager: AirportStateManager;
    maxDataSize: number;
}

export class AirportFetcher {
    private neededDataGetter: AirportFetcherCtx["neededDataGetter"];
    private dataAPIFetcher: AirportFetcherCtx["dataAPIFetcher"];
    private stateManager: AirportFetcherCtx["stateManager"];
    private maxDataSize: AirportFetcherCtx["maxDataSize"];
    private batch!: number;
    private offset!: number;

    constructor(ctx: AirportFetcherCtx) {
        this.neededDataGetter = ctx.neededDataGetter;
        this.dataAPIFetcher = ctx.dataAPIFetcher;
        this.stateManager = ctx.stateManager;
        this.maxDataSize = ctx.maxDataSize;

        this.fetchAndUpdateAirports = takeLatest(
            this.fetchAndUpdateAirports.bind(this),
            ctx.throttleDelayTimeInMs
        );
    }

    fetchInit() {
        console.log("Fetching Initial");
        this.batch = this.maxDataSize;
        this.offset = 0;
        this.fetchAndUpdateAirports();
    }

    fetchPrev({ batch = this.maxDataSize }: { batch?: number }) {
        const state = this.stateManager.getState();

        this.batch = batch;
        this.offset = Math.max(0, state.currOffset - this.batch);
        console.log("Fetching Prev", this.batch, this.offset);
        this.fetchAndUpdateAirports();
    }

    fetchNext({ batch = this.maxDataSize }: { batch?: number }) {
        const state = this.stateManager.getState();

        this.batch = batch;
        this.offset = state.currOffset + state.airports.length;
        console.log("Fetching Next", this.batch, this.offset);
        this.fetchAndUpdateAirports();
    }

    private async fetchAndUpdateAirports() {
        const state = this.stateManager.getState();
        if (state.isFetching) return;

        this.stateManager.updateState((s) => ({ ...s, isFetching: true }));
        const { airports } = await this.dataAPIFetcher(state.searchValue, this.offset, this.batch);
        this.stateManager.updateState((s) => ({
            ...s,
            isFetching: false,
            ...this.getStateUpdate(airports),
        }));
    }

    private getStateUpdate(fetchedAirports: AirportDetail[]): {
        airports?: AirportDetail[];
        currOffset?: number;
    } {
        if (!fetchedAirports.length) return {};

        const ctx = {
            fetchedData: fetchedAirports,
            currData: this.stateManager.getState().airports,
            neededMaxSize: this.maxDataSize,
            getKey: (airport: AirportDetail) => airport.id,
        };
        const state = this.stateManager.getState();
        let airports: AirportDetail[];

        if (this.offset < state.currOffset) airports = this.neededDataGetter.withFetchedAtTop(ctx);
        else airports = this.neededDataGetter.withFetchedAtBottom(ctx);

        return { airports, currOffset: this.offset };
    }
}
