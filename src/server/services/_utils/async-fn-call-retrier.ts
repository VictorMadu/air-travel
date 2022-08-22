import { AsyncFnCallRetrier } from "./async-fn-call-retrier.types";

export class AsyncFnCallRetrierImpl<T extends any> implements AsyncFnCallRetrier<T> {
    private noOfRetries = 0;
    private errs: any[] = [];
    private fn: () => Promise<T>;
    private maxRetries: number;

    constructor() {}

    createNewInstance<T extends any>(fn: () => Promise<T>, maxRetries: number) {
        const asyncFnCallRetrier = new AsyncFnCallRetrierImpl<T>();
        asyncFnCallRetrier.fn = fn;
        asyncFnCallRetrier.maxRetries = maxRetries;

        return asyncFnCallRetrier;
    }

    run(): Promise<T> {
        return this.fn()
            .then((result) => result)
            .catch((err) => {
                this.errs.push(err);
                this.noOfRetries++;

                console.log("retry failed the ", this.noOfRetries);

                if (this.noOfRetries < this.maxRetries) return this.run();
                else return Promise.reject(this.errs);
            });
    }
}
