import { FuncParams, Func } from "ts-util-types";

// TODO: Add to ts-util-types
type Arguments<Args extends any[]> = { [key: number]: Args[number]; length: number };

// TODO: Write an advanced memoize library
export default function memoize<T extends Func>(fn: T, cacheSize: number = 1): T {
    const cacheStore = new CacheStore<T>(cacheSize);

    function inner() {
        const args: Arguments<FuncParams<T>> = <any>arguments;
        console.log("MEMO ARGUMENTS OOO", args);
        console.log("MEMO ARGUMENTS OOO2", ...Object.values(args));
        let index = cacheStore.getItemIndexUsing(args);
        if (index === CacheStore.NOT_FOUND) {
            index = cacheStore.addToCache(args, fn(...Object.values(args))).getLastAddIndex();
        }
        console.log("MEMO RETURNS OOO", cacheStore.getResultAt(index));
        return cacheStore.getResultAt(index);
    }
    return <T>inner;
}

class CacheStore<T extends Func> {
    static NOT_FOUND = -1;
    private cacheStore: Item<T>[] = new Array(this.maxSize);
    private front = 0;
    private size = 0;
    private lastAddIndex = CacheStore.NOT_FOUND;

    constructor(private maxSize: number) {}

    getItemIndexUsing(itemArgs: Arguments<FuncParams<T>>) {
        let c = 0;
        let itemArgIndex: number;

        for (; c < this.size; c++) {
            const cacheArgs = this.cacheStore[c].args;
            if (itemArgs.length !== cacheArgs.length) return CacheStore.NOT_FOUND;
            for (itemArgIndex = 0; itemArgIndex < itemArgs.length; itemArgIndex++) {
                const hasDifferentRef = itemArgs[itemArgIndex] !== cacheArgs[itemArgIndex];
                if (hasDifferentRef) break;
            }
            const isIndexFound = itemArgIndex === itemArgs.length;
            if (isIndexFound) return c;
        }
        return CacheStore.NOT_FOUND;
    }

    addToCache(args: Arguments<FuncParams<T>>, result: ReturnType<T>) {
        this.freeStoreIfFull();
        this.addItemToCache(args, result);
        return this;
    }

    getResultAt(index: number) {
        return this.cacheStore[index].result;
    }

    getLastAddIndex() {
        return this.lastAddIndex;
    }

    private freeStoreIfFull() {
        if (this.size < this.maxSize) return;

        if (--this.front < 0) this.front = this.maxSize - 1;
        delete this.cacheStore[this.front];
        --this.size;
    }

    private addItemToCache(args: Arguments<FuncParams<T>>, result: ReturnType<T>) {
        this.lastAddIndex = this.front;
        this.cacheStore[this.lastAddIndex] = { args, result };
        this.front = (this.lastAddIndex + 1) % this.maxSize;
        ++this.size;
    }
}

interface Item<T extends Func> {
    args: Arguments<FuncParams<T>>;
    result: ReturnType<T>;
}
