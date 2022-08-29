export class Queue<T extends Exclude<any, undefined>, E extends any> {
    static NOT_FOUND = -1;

    private store: T[] = new Array(this.capacity);
    private size = 0;
    private tail = 0;

    constructor(private capacity: number, private isEqualFn: (check: E, currItem: T) => boolean) {}

    enqueue(item: T) {
        const index = this.tail;
        this.store[index] = item;
        this.size = Math.min(this.size + 1, this.capacity);

        if (this.tail === this.getLastIndex()) this.tail = 0;
        else this.tail++;

        return index;
    }

    dequeue() {
        const item = this.store[this.tail];
        this.size = Math.max(this.size - 1, 0);

        if (this.tail === 0) this.tail = this.getLastIndex();
        else this.tail--;

        return item;
    }

    getIndexOfItem(check: E) {
        for (let i = 0; i < this.getSize(); i++) {
            const data = this.store[i];
            if (this.isEqualFn(check, data)) return i;
        }
        return Queue.NOT_FOUND;
    }

    getItemAt(index: number) {
        return this.store[index];
    }

    getSize() {
        return this.size;
    }

    isFull() {
        return this.size === this.capacity;
    }

    isNotFound(index: number) {
        return index === Queue.NOT_FOUND;
    }

    private getLastIndex() {
        return this.capacity - 1;
    }
}
