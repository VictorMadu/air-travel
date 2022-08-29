import { Func, FuncParams } from "ts-util-types";
import {
    NeededDataGetterCtx,
    Key,
    StrategyManager,
    LoopActionRunner,
    FetchedPositionStrategy,
    NeededInserter,
    AllNeededInsertManager,
    NeededDataGetter,
    GetNeededDataFn,
    FnForMemo,
    NeededDataGetterWithMemo,
} from "./needed-data-getter.types";

export type { NeededDataGetterCtx } from "./needed-data-getter.types";

export class NeededDataGetterWithMemoImpl<T extends any> implements NeededDataGetterWithMemo<T> {
    private cacheSize!: number;
    private withFetchedAtTopMemo: Func<T[], FuncParams<FnForMemo<T>>>;
    private withFetchedAtBottomMemo: Func<T[], FuncParams<FnForMemo<T>>>;

    constructor(
        private neededDataGetter: NeededDataGetter<T>,
        private memoizeFn: (fn: FnForMemo<T>, cacheSize: number) => FnForMemo<T>
    ) {
        // TODO: Use decorator method to make class shorter and less complicated and aviod the code below
        this.withFetchedAtTopMemo = this.createGetNeededDataMemo(
            neededDataGetter.withFetchedAtTop.bind(neededDataGetter)
        );
        this.withFetchedAtBottomMemo = this.createGetNeededDataMemo(
            neededDataGetter.withFetchedAtBottom.bind(neededDataGetter)
        );
    }

    getNewInstance<T extends any>(cacheSize: number) {
        const newInstance = new NeededDataGetterWithMemoImpl<T>(
            this.neededDataGetter as NeededDataGetter<T>,
            this.memoizeFn as (fn: FnForMemo<T>, cacheSize: number) => FnForMemo<T>
        );

        newInstance.cacheSize = cacheSize;
        return newInstance;
    }

    withFetchedAtTop(ctx: NeededDataGetterCtx<T>) {
        return this.withFetchedAtTopMemo(...this.getArgs(ctx));
    }

    withFetchedAtBottom(ctx: NeededDataGetterCtx<T>) {
        return this.withFetchedAtBottomMemo(...this.getArgs(ctx));
    }

    private createGetNeededDataMemo(getNeededDataFn: GetNeededDataFn<T>) {
        return this.memoizeFn((fetched, curr, batch, getKey) => {
            return getNeededDataFn({
                fetchedData: fetched,
                currData: curr,
                batch,
                getKey,
            });
        }, this.cacheSize);
    }

    private getArgs(ctx: NeededDataGetterCtx<T>): FuncParams<FnForMemo<T>> {
        return [ctx.fetchedData, ctx.currData, ctx.batch, ctx.getKey];
    }
}

export default class NeededDataGetterImpl<T extends any> implements NeededDataGetter<T> {
    private strategyManager = new StrategyManagerImpl<T>(new LoopActionRunnerImpl<T>());
    private strategy!: FetchedPositionStrategy<T>;
    private ctx!: NeededDataGetterCtx<T>;

    withFetchedAtTop(ctx: NeededDataGetterCtx<T>) {
        this.ctx = ctx;
        this.strategy = new FetchedAtTopStrategy<T>();
        return this.fetch();
    }

    withFetchedAtBottom(ctx: NeededDataGetterCtx<T>) {
        this.ctx = ctx;
        this.strategy = new FetchedAtBottomStrategy<T>();
        return this.fetch();
    }

    private fetch() {
        const insertManager = new AllNeededInsertManagerImpl(
            this.ctx.fetchedData,
            this.ctx.currData,
            this.ctx.batch,
            this.ctx.getKey
        );
        return this.strategyManager
            .setInsertManager(insertManager)
            .setStrategy(this.strategy)
            .getAllNeededData();
    }
}

class StrategyManagerImpl<T extends any> implements StrategyManager<T> {
    private insertManager!: AllNeededInsertManager<T>;
    private strategy!: FetchedPositionStrategy<T>;

    constructor(private loopActionRunner: LoopActionRunnerImpl<T>) {}

    setStrategy(strategy: FetchedPositionStrategy<T>) {
        this.strategy = strategy;
        return this;
    }

    setInsertManager(insertManager: AllNeededInsertManager<T>) {
        this.insertManager = insertManager;
        return this;
    }

    getAllNeededData() {
        return this.strategy.getAllNeededData(this.loopActionRunner, this.insertManager);
    }
}

class LoopActionRunnerImpl<T extends any> implements LoopActionRunner<T> {
    private manager!: NeededInserter<T>;
    private start!: (manager: NeededInserter<T>) => number;
    private incr!: (index: number, manager: NeededInserter<T>) => number;
    private shouldContinue!: (index: number, manager: NeededInserter<T>) => boolean;
    private action!: (index: number, manager: NeededInserter<T>) => void;

    setDataInsertManager(manager: NeededInserter<T>) {
        this.manager = manager;
        return this;
    }
    setStart(start: (manager: NeededInserter<T>) => number) {
        this.start = start;
        return this;
    }

    setIncrStrategy(incr: (currIndex: number) => number) {
        this.incr = incr;
        return this;
    }

    setShouldContinue(shouldContinue: (index: number, manager: NeededInserter<T>) => boolean) {
        this.shouldContinue = shouldContinue;
        return this;
    }

    setAction(action: (index: number, manager: NeededInserter<T>) => void) {
        this.action = action;
        return this;
    }

    run() {
        let i = this.start(this.manager);
        while (this.shouldContinue(i, this.manager)) {
            this.action(i, this.manager);
            i = this.incr(i, this.manager);
        }
    }
}

class NeededInserterImpl<T extends any> implements NeededInserter<T> {
    private needed!: T[];
    private size!: number;
    private _isLastOpSuccess!: boolean;

    constructor(
        private data: T[],
        private allInsertedKeys: Set<Key>,
        private getKey: (item: T) => Key
    ) {}

    getAllDataSize() {
        return this.data.length;
    }

    getNeededSize() {
        return this.size;
    }

    isLastOpSuccess() {
        return this._isLastOpSuccess;
    }

    getNeededAt(index: number) {
        return this.needed[index];
    }

    reset() {
        this.needed = new Array(this.data.length);
        this.size = 0;
    }

    insertIfNotYetDataAt(index: number) {
        const dataum = this.data[index];
        const key = this.getKey(dataum);

        this._isLastOpSuccess = false;
        if (this.allInsertedKeys.has(key)) return;

        this.needed[this.size++] = dataum;
        this.allInsertedKeys.add(key);

        this._isLastOpSuccess = true;
    }
}
class AllNeededInsertManagerImpl<T extends any> implements AllNeededInsertManager<T> {
    private insertedKeys = new Set<Key>();
    private allNeededData!: T[];
    private allNeededDataSize!: number;

    readonly fetchedInserter = new NeededInserterImpl(
        this.fetchedData,
        this.insertedKeys,
        this.getKey
    );
    readonly currInserter = new NeededInserterImpl(this.currData, this.insertedKeys, this.getKey);

    constructor(
        private fetchedData: T[],
        private currData: T[],
        private maxLength: number,
        private getKey: (item: T) => Key
    ) {}

    isNoOfInsertsBelowMax() {
        return this.insertedKeys.size < this.maxLength;
    }

    initializeAllNeededDataStore() {
        this.allNeededData = new Array(this.insertedKeys.size);
        this.allNeededDataSize = 0;
    }

    addToAllNeededData(datum: T) {
        this.allNeededData[this.allNeededDataSize++] = datum;
    }

    getAllNeededDataFromStore() {
        return this.allNeededData;
    }

    reset() {
        this.fetchedInserter.reset();
        this.currInserter.reset();
        this.insertedKeys.clear();
    }
}

// TODO: For the two startegies name methods the mental model you are using to solve the problem
class FetchedAtTopStrategy<T extends any> implements FetchedPositionStrategy<T> {
    private loopRunner!: LoopActionRunner<T>;
    private insertManager!: AllNeededInsertManager<T>;

    getAllNeededData(loopRunner: LoopActionRunner<T>, insertManager: AllNeededInsertManager<T>) {
        this.loopRunner = loopRunner;
        this.insertManager = insertManager;

        this.setUpBaseForEverything();

        this.setUpBaseForNeededRunner();
        this.getNeededFetched();
        this.getNeededCurr();

        this.initializeAllNeededDataArr();
        this.setUpBaseForAllNeededRunner();
        this.addNeededFetchedToAll();
        this.addNeededCurrToAll();

        return this.insertManager.getAllNeededDataFromStore();
    }

    private setUpBaseForEverything() {
        this.insertManager.reset();
        this.loopRunner.setStart(() => 0).setIncrStrategy((i) => ++i);
    }

    private setUpBaseForNeededRunner() {
        this.loopRunner
            .setShouldContinue(
                (i, manager) => i < manager.getAllDataSize() && this.isNoOfInsertsBelowMax()
            )
            .setAction((index, manager) => manager.insertIfNotYetDataAt(index));
    }

    private getNeededFetched() {
        this.loopRunner.setDataInsertManager(this.insertManager.fetchedInserter).run();
    }

    private getNeededCurr() {
        this.loopRunner.setDataInsertManager(this.insertManager.currInserter).run();
    }

    private initializeAllNeededDataArr() {
        this.insertManager.initializeAllNeededDataStore();
    }

    private setUpBaseForAllNeededRunner() {
        this.loopRunner
            .setShouldContinue((i, manager) => i < manager.getNeededSize())
            .setAction((index, manager) =>
                this.insertManager.addToAllNeededData(manager.getNeededAt(index))
            );
    }

    private addNeededFetchedToAll() {
        this.loopRunner.setDataInsertManager(this.insertManager.fetchedInserter).run();
    }

    private addNeededCurrToAll() {
        this.loopRunner.setDataInsertManager(this.insertManager.currInserter).run();
    }

    private isNoOfInsertsBelowMax() {
        return this.insertManager.isNoOfInsertsBelowMax();
    }
}

class FetchedAtBottomStrategy<T extends any> implements FetchedPositionStrategy<T> {
    private loopRunner!: LoopActionRunner<T>;
    private insertManager!: AllNeededInsertManager<T>;

    getAllNeededData(loopRunner: LoopActionRunner<T>, insertManager: AllNeededInsertManager<T>) {
        this.loopRunner = loopRunner;
        this.insertManager = insertManager;

        this.setUpBaseForEverything();

        this.setUpBaseForNeededRunner();
        this.getNeededFetched();
        this.getNeededCurr();

        this.initializeAllNeededDataArr();
        this.setUpBaseForAllNeededRunner();
        this.addNeededCurrToAll();
        this.addNeededFetchedToAll();

        return this.insertManager.getAllNeededDataFromStore();
    }

    private setUpBaseForEverything() {
        this.insertManager.reset();
    }

    private setUpBaseForNeededRunner() {
        this.loopRunner.setAction((index, manager) => manager.insertIfNotYetDataAt(index));
    }

    private getNeededFetched() {
        this.loopRunner
            .setStart(() => 0)
            .setIncrStrategy((i) => ++i)
            .setShouldContinue(
                (i, manager) => i < manager.getAllDataSize() && this.isNoOfInsertsBelowMax()
            )
            .setDataInsertManager(this.insertManager.fetchedInserter)
            .run();
    }

    private getNeededCurr() {
        this.loopRunner
            .setStart((manager) => manager.getAllDataSize() - 1)
            .setIncrStrategy((i) => --i)
            .setShouldContinue((i) => i > -1 && this.isNoOfInsertsBelowMax())
            .setDataInsertManager(this.insertManager.currInserter)
            .run();
    }

    private initializeAllNeededDataArr() {
        this.insertManager.initializeAllNeededDataStore();
    }

    private setUpBaseForAllNeededRunner() {
        this.loopRunner.setAction((index, manager) =>
            this.insertManager.addToAllNeededData(manager.getNeededAt(index))
        );
    }

    // Since needed curr first
    private addNeededCurrToAll() {
        this.loopRunner
            .setStart(() => this.insertManager.currInserter.getNeededSize() - 1)
            .setIncrStrategy((i) => --i)
            .setShouldContinue((i) => i > -1)
            .setDataInsertManager(this.insertManager.currInserter)
            .run();
    }

    private addNeededFetchedToAll() {
        this.loopRunner
            .setStart(() => 0)
            .setIncrStrategy((i) => ++i)
            .setShouldContinue((i, manager) => i < manager.getNeededSize())
            .setDataInsertManager(this.insertManager.fetchedInserter)
            .run();
    }

    private isNoOfInsertsBelowMax() {
        return this.insertManager.isNoOfInsertsBelowMax();
    }
}
