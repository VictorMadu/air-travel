export interface AsyncFnCallRetrier<T extends any> {
    createNewInstance<T extends any>(
        fn: () => Promise<T>,
        maxRetries: number
    ): AsyncFnCallRetrier<T>;

    run(): Promise<T>;
}
