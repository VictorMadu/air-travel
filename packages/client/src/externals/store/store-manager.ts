import { StoreManager } from "./store-manager.types";

export class StoreManagerImpl implements StoreManager {
    constructor(private root = "__root", private getLocalStorage: () => Storage) {}

    getFromStore<T extends {}>(storeKey: string): T | undefined {
        const data = this.getAllData();
        return data[storeKey] as T | undefined;
    }

    saveToStore(storeKey: string, item: {}) {
        const data = this.getAllData();
        data[storeKey] = item;
        this.saveAllData(data);
    }

    deleteFromStore(storeKey: string) {
        const data = this.getAllData();
        delete data[storeKey];
        this.saveAllData(data);
    }

    private getAllData(): { [key: string]: {} } {
        const serializedData = this.getLocalStorage().getItem(this.root);

        if (serializedData) return JSON.parse(serializedData);
        return {};
    }

    private saveAllData(data: { [key: string]: {} }) {
        const serializedData = JSON.stringify(data);
        this.getLocalStorage().setItem(this.root, serializedData);
    }
}
