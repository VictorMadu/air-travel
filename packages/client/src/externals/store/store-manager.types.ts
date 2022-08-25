export interface StoreManager {
    getFromStore<T extends {}>(storeKey: string): T | undefined;
    saveToStore(storeKey: string, item: {}): void;
    deleteFromStore(storeKey: string): void;
}
