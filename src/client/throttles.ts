export function takeFirst<F extends (...args: any[]) => void>(fn: F, delayInMs: number): F {
    let prevCallTimeInMs = 0;

    function inner(...args: any[]): any {
        const now = new Date().getTime();
        const callTimeDiffInMs = now - prevCallTimeInMs;

        if (callTimeDiffInMs > delayInMs) {
            prevCallTimeInMs = now;
            fn(...args);
        }
    }

    return <F>inner;
}

export function takeLatest<F extends (...args: any[]) => void>(fn: F, delayInMs: number): F {
    let hasBeforeCallBefore = false;
    let delayedFnCall: NodeJS.Timeout;

    function inner(...args: any[]): any {
        if (hasBeforeCallBefore) clearTimeout(delayedFnCall);
        else hasBeforeCallBefore = true;

        delayedFnCall = setTimeout(() => {
            fn(...args);
        }, delayInMs);
    }

    return <F>inner;
}
