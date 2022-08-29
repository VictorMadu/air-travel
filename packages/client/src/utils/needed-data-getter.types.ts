export type FnForMemo<T extends any> = (
    fetched: T[],
    curr: T[],
    batch: number,
    getKey: (datum: T) => Key
) => T[];

export type GetNeededDataFn<T extends any> = (ctx: NeededDataGetterCtx<T>) => T[];

export interface NeededDataGetterWithMemo<T extends any> extends NeededDataGetter<T> {
    getNewInstance(cacheSize: number, getKey: (datum: T) => Key): NeededDataGetterWithMemo<T>;
}

export interface NeededDataGetterCtx<T extends any> {
    fetchedData: T[];
    currData: T[];
    batch: number;
    getKey: (datum: T) => Key;
}

export interface NeededDataGetter<T extends any> {
    withFetchedAtTop(ctx: NeededDataGetterCtx<T>): T[];
    withFetchedAtBottom(ctx: NeededDataGetterCtx<T>): T[];
}

export interface StrategyManager<T extends any> {
    setStrategy(strategy: FetchedPositionStrategy<T>): this;
    setInsertManager(insertManager: AllNeededInsertManager<T>): this;
    getAllNeededData(): T[];
}

export interface LoopActionRunner<T extends any> {
    setStart(start: (manager: NeededInserter<T>) => number): this;
    setShouldContinue(shouldContinue: (index: number, manager: NeededInserter<T>) => boolean): this;
    setIncrStrategy(incr: (currIndex: number) => number): this;
    setAction(action: (index: number, manager: NeededInserter<T>) => void): this;

    setDataInsertManager(manager: NeededInserter<T>): this;
    run(): void;
}

export interface NeededInserter<T extends any> {
    getAllDataSize(): number;
    getNeededSize(): number;
    isLastOpSuccess(): boolean;
    getNeededAt(index: number): T;
    reset(): void;
    insertIfNotYetDataAt(index: number): void;
}

export interface AllNeededInsertManager<T extends any> {
    fetchedInserter: NeededInserter<T>;
    currInserter: NeededInserter<T>;
    isNoOfInsertsBelowMax(): boolean;
    initializeAllNeededDataStore(): void;
    addToAllNeededData(datum: T): void;
    getAllNeededDataFromStore(): T[];
    reset(): void;
}

export interface FetchedPositionStrategy<T extends any> {
    getAllNeededData(
        loopRunner: LoopActionRunner<T>,
        insertManager: AllNeededInsertManager<T>
    ): T[];
}

export type Key = string | number;
