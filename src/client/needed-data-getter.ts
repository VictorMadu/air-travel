export interface NeededDataCtx<T extends any> {
    fetchedData: T[];
    currData: T[];
    batch: number;
    getKey: (datum: T) => Key;
}

export default class NeededData<T extends any> {
    private neededDataGetter = new NeededDataGetter<T>();
    private strategy: FetchedPositionStrategy<T>;
    private ctx: NeededDataCtx<T>;

    constructor() {}

    withFetchedAtTop(ctx: NeededDataCtx<T>) {
        this.ctx = ctx;
        console.log("NeededData CTX", ctx);
        this.strategy = new FetchedAtTopStrategy<T>();
        return this.fetch();
    }

    withFetchedAtBottom(ctx: NeededDataCtx<T>) {
        this.ctx = ctx;
        console.log("NeededData Bottom CTX", ctx);
        this.strategy = new FetchedAtBottomStrategy<T>();
        return this.fetch();
    }

    fetch() {
        const insertManager = new InsertManager(
            this.ctx.fetchedData,
            this.ctx.currData,
            this.ctx.batch,
            this.ctx.getKey
        );
        return this.neededDataGetter
            .setInsertManager(insertManager)
            .setStrategy(this.strategy)
            .get();
    }
}

class NeededDataGetter<T extends any> {
    private loopActionRunner = new LoopActionRunner<T>();
    private insertManager: InsertManager<T>;
    private strategy: FetchedPositionStrategy<T>;

    setStrategy(strategy: FetchedPositionStrategy<T>) {
        this.strategy = strategy;
        return this;
    }

    setInsertManager(insertManager: InsertManager<T>) {
        this.insertManager = insertManager;
        return this;
    }

    get() {
        return this.strategy.getAllNeededData(this.loopActionRunner, this.insertManager);
    }
}

class LoopActionRunner<T extends any> {
    private manager: NeededDataInsertManager<T>;
    private start: (manager: NeededDataInsertManager<T>) => number;
    private incr: (index: number, manager: NeededDataInsertManager<T>) => number;
    private shouldContinue: (index: number, manager: NeededDataInsertManager<T>) => boolean;
    private action: (index: number, manager: NeededDataInsertManager<T>) => void;

    setDataInsertManager(manager: NeededDataInsertManager<T>) {
        this.manager = manager;
        return this;
    }
    setStart(start: (manager: NeededDataInsertManager<T>) => number) {
        this.start = start;
        return this;
    }

    setIncrStrategy(incr: (currIndex: number) => number) {
        this.incr = incr;
        return this;
    }

    setShouldContinue(
        shouldContinue: (index: number, manager: NeededDataInsertManager<T>) => boolean
    ) {
        this.shouldContinue = shouldContinue;
        return this;
    }

    setAction(action: (index: number, manager: NeededDataInsertManager<T>) => void) {
        this.action = action;
        return this;
    }

    run() {
        let i = this.start(this.manager);
        while (this.shouldContinue(i, this.manager)) {
            this.action(i, this.manager);
            i = this.incr(i, this.manager);
        }
        return this;
    }
}

class NeededDataInsertManager<T extends any> {
    private neededData: T[];
    private size: number;
    private _isLastOpSuccess: boolean;

    constructor(
        private data: T[],
        private allInsertedKeys: Set<Key>,
        private getKey: (item: T) => Key
    ) {
        console.log("NeededDataInsertManager data", data);
    }

    getAllSize() {
        return this.data.length;
    }

    getNeededSize() {
        return this.size;
    }

    isLastOpSuccess() {
        return this._isLastOpSuccess;
    }

    getNeededDatumAt(index: number) {
        return this.neededData[index];
    }

    reset() {
        this.neededData = new Array(this.data.length);
        this.size = 0;
    }

    insertIfNotYetDataAt(index: number) {
        const dataum = this.data[index];
        const key = this.getKey(dataum);

        this._isLastOpSuccess = false;
        if (this.allInsertedKeys.has(key)) return;

        this.neededData[this.size++] = dataum;
        this.allInsertedKeys.add(key);

        this._isLastOpSuccess = true;
    }
}

type Key = string | number;

class InsertManager<T extends any> {
    private insertedKeys = new Set<Key>();
    private allNeededData: T[];
    private allNeededDataSize: number;

    readonly fetchedInsertManager = new NeededDataInsertManager(
        this.fetchedData,
        this.insertedKeys,
        this.getKey
    );
    readonly currInsertManager = new NeededDataInsertManager(
        this.currData,
        this.insertedKeys,
        this.getKey
    );

    constructor(
        private fetchedData: T[],
        private currData: T[],
        private maxLength: number,
        private getKey: (item: T) => Key
    ) {
        console.log("InsertManager fetchedData", this.fetchedData);
        console.log("InsertManager currData", this.currData);
    }

    isInsertsBelowMax() {
        return this.insertedKeys.size < this.maxLength;
    }

    initializeAllNeededData() {
        this.allNeededData = new Array(this.insertedKeys.size);
        this.allNeededDataSize = 0;
    }

    addToAllNeededData(datum: T) {
        this.allNeededData[this.allNeededDataSize++] = datum;
    }

    getAllNeededData() {
        return this.allNeededData;
    }

    reset() {
        this.fetchedInsertManager.reset();
        this.currInsertManager.reset();
        this.insertedKeys.clear();
    }
}

interface FetchedPositionStrategy<T extends any> {
    getAllNeededData(loopRunner: LoopActionRunner<T>, insertManager: InsertManager<T>): T[];
}

// TODO: For the two startegies name methods the mental model you are using to solve the problem
class FetchedAtTopStrategy<T extends any> implements FetchedPositionStrategy<T> {
    private loopRunner = new LoopActionRunner<T>();
    private insertManager: InsertManager<T>;

    getAllNeededData(loopRunner = new LoopActionRunner<T>(), insertManager: InsertManager<T>) {
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

        return this.insertManager.getAllNeededData();
    }

    private setUpBaseForEverything() {
        this.insertManager.reset();
        this.loopRunner.setStart(() => 0).setIncrStrategy((i) => ++i);
    }

    private setUpBaseForNeededRunner() {
        this.loopRunner
            .setShouldContinue((i, manager) => i < manager.getAllSize() && this.isInsertsBelowMax())
            .setAction((index, manager) => manager.insertIfNotYetDataAt(index));
    }

    private getNeededFetched() {
        this.loopRunner.setDataInsertManager(this.insertManager.fetchedInsertManager).run();
    }

    private getNeededCurr() {
        this.loopRunner.setDataInsertManager(this.insertManager.currInsertManager).run();
    }

    private initializeAllNeededDataArr() {
        this.insertManager.initializeAllNeededData();
    }

    private setUpBaseForAllNeededRunner() {
        this.loopRunner
            .setShouldContinue((i, manager) => i < manager.getNeededSize())
            .setAction((index, manager) =>
                this.insertManager.addToAllNeededData(manager.getNeededDatumAt(index))
            );
    }

    private addNeededFetchedToAll() {
        this.loopRunner.setDataInsertManager(this.insertManager.fetchedInsertManager).run();
    }

    private addNeededCurrToAll() {
        this.loopRunner.setDataInsertManager(this.insertManager.currInsertManager).run();
    }

    private isInsertsBelowMax() {
        return this.insertManager.isInsertsBelowMax();
    }
}

class FetchedAtBottomStrategy<T extends any> implements FetchedPositionStrategy<T> {
    private loopRunner = new LoopActionRunner<T>();
    private insertManager: InsertManager<T>;

    getAllNeededData(loopRunner: LoopActionRunner<T>, insertManager: InsertManager<T>) {
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

        return this.insertManager.getAllNeededData();
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
            .setShouldContinue((i, manager) => i < manager.getAllSize() && this.isInsertsBelowMax())
            .setDataInsertManager(this.insertManager.fetchedInsertManager)
            .run();
    }

    private getNeededCurr() {
        this.loopRunner
            .setStart((manager) => manager.getAllSize() - 1)
            .setIncrStrategy((i) => --i)
            .setShouldContinue((i) => i > -1 && this.isInsertsBelowMax())
            .setDataInsertManager(this.insertManager.currInsertManager)
            .run();
    }

    private initializeAllNeededDataArr() {
        this.insertManager.initializeAllNeededData();
    }

    private setUpBaseForAllNeededRunner() {
        this.loopRunner.setAction((index, manager) =>
            this.insertManager.addToAllNeededData(manager.getNeededDatumAt(index))
        );
    }

    // Since needed curr first
    private addNeededCurrToAll() {
        this.loopRunner
            .setStart(() => this.insertManager.currInsertManager.getNeededSize() - 1)
            .setIncrStrategy((i) => --i)
            .setShouldContinue((i) => i > -1)
            .setDataInsertManager(this.insertManager.currInsertManager)
            .run();
    }

    private addNeededFetchedToAll() {
        this.loopRunner
            .setStart(() => 0)
            .setIncrStrategy((i) => ++i)
            .setShouldContinue((i, manager) => i < manager.getNeededSize())
            .setDataInsertManager(this.insertManager.fetchedInsertManager)
            .run();
    }

    private isInsertsBelowMax() {
        return this.insertManager.isInsertsBelowMax();
    }
}
