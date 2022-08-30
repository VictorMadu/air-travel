import { StoreManager } from "./store-manager.types";
import { Store, Data, Listener } from "./store.types";

export class StoreImpl<T extends Data> implements Store<T> {
    private listeners = new Set<Listener<T>>();
    constructor(private manager: StoreManager, private key: string, private nullData: T) {}

    save(data: T) {
        this.manager.saveToStore(this.key, data);
        this.notifyListeners(data);
    }

    get() {
        const data = this.manager.getFromStore<T>(this.key);

        if (data != null) return data;
        return this.nullData;
    }

    delete() {
        this.manager.deleteFromStore(this.key);
    }

    listen(fn: Listener<T>): void {
        this.listeners.add(fn);
    }

    unlisten(fn: Listener<T>): void {
        this.listeners.delete(fn);
    }

    isNull(data: T) {
        return data === this.nullData;
    }

    private notifyListeners(data: T) {
        const listenersIterator = this.listeners[Symbol.iterator]();

        let listener: Listener<T>;
        while ((listener = listenersIterator.next().value)) {
            listener(data);
        }
    }
}
