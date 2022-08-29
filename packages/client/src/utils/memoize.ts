import { FuncParams, Func } from "ts-util-types";
import { Queue } from "./queue";

// TODO: Add to ts-util-types
type Arguments<Args extends any[]> = { [key: number]: Args[number]; length: number };

// TODO: Write an advanced memoize library
export default function memoize<T extends Func>(fn: T, cacheSize: number = 1): T {
    const cacheStore = new CacheStore<T>(cacheSize);

    function inner() {
        let index = cacheStore.getItemIndexUsing(arguments);
        if (cacheStore.isNotFound(index))
            index = cacheStore
                .addToCache(arguments, fn(...Object.values(arguments)))
                .getLastInsertIndex();

        return cacheStore.getResultAt(index).result;
    }
    return inner as T;
}

// Uses the concept of queue
class CacheStore<T extends Func> {
    private queue: Queue<Item<T>, Arguments<FuncParams<T>>>;
    private lastInsertIndex = Queue.NOT_FOUND;

    constructor(private maxSize: number) {
        this.queue = new Queue(this.maxSize, this.isEqual.bind(this));
    }

    addToCache(args: Arguments<FuncParams<T>>, result: ReturnType<T>) {
        this.lastInsertIndex = this.queue.enqueue({ args, result });
        return this;
    }

    getItemIndexUsing(itemArgs: Arguments<FuncParams<T>>) {
        const index = this.queue.getIndexOfItem(itemArgs);

        if (this.queue.isNotFound(index)) return Queue.NOT_FOUND;
        return index;
    }

    getLastInsertIndex() {
        return this.lastInsertIndex;
    }

    getResultAt(index: number) {
        return this.queue.getItemAt(index);
    }

    isNotFound(index: number) {
        return index === Queue.NOT_FOUND;
    }

    private isEqual(checkArgs: Arguments<FuncParams<T>>, data: Item<T>) {
        const dataArgs = data.args;

        if (checkArgs.length !== dataArgs.length) return false;
        for (let i = 0; i < checkArgs.length; i++) {
            if (checkArgs[i] !== dataArgs[i]) return false;
        }
        return true;
    }
}

interface Item<T extends Func> {
    args: Arguments<FuncParams<T>>;
    result: ReturnType<T>;
}
