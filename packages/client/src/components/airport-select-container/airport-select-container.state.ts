import { AirportDetail, State } from "./airport-select-container.types";

export class AirportStateManager {
    static nullAirport: AirportDetail = { id: "", name: "" };

    private static initialState: State = {
        airports: [],
        currOffset: 0,
        isFetching: false,
        searchValue: "",
        selectedAirport: AirportStateManager.nullAirport,
    };
    private state: State = AirportStateManager.initialState;
    private listeners = new Set<(s: State) => void>();

    addListener(listener: (s: State) => void) {
        this.listeners.add(listener);
        listener(this.state);
        return () => {
            this.listeners.delete(listener);
        };
    }

    getState() {
        return this.state;
    }

    updateState(fn: (oldState: State) => State) {
        this.state = fn(this.state);
        this.notifyListenersOfStateChange();
    }

    private notifyListenersOfStateChange() {
        const iterator = this.listeners[Symbol.iterator]();
        for (let item = iterator.next(); !item.done; item = iterator.next()) {
            const { value: setState } = item;
            setState(this.state);
        }
    }
}
