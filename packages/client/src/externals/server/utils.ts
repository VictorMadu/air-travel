import { FuncParams } from "ts-util-types";

const throttleTimeInMs = 1000;

export const serverCallThrottle = <T extends (...args: any[]) => any>(fn: T) =>
    throttleFn(fn, throttleTimeInMs);

export function throttleFn<T extends (...args: any[]) => any>(fn: T, delayInMs: number): T {
    let prevCallTime = 0;
    let result: ReturnType<T>;

    function innerFn(...args: FuncParams<T>): ReturnType<T> {
        const now = new Date().getTime();
        const callTimeDiffInMs = now - prevCallTime;

        if (callTimeDiffInMs > delayInMs) {
            prevCallTime = now;
            result = fn(...args);
        }

        return result;
    }

    return <T>innerFn;
}
