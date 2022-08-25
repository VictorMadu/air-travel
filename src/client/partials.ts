import { Func } from "ts-util-types";

export default function createPartial<S extends any>(state: S, dispatch: Dispatch<S>) {
    function forStateFn<A extends any[], R extends any>(fn: PartialFn<S, A, R>) {
        return partialWith(fn, state);
    }

    function forDispatch<A extends any[], R extends any>(fn: PartialFn<Dispatch<S>, A, R>) {
        return partialWith(fn, dispatch);
    }

    function forState<A extends any[], R extends any>(fn: PartialFn<S, A, R>, ...args: A) {
        return forStateFn(fn)(...args);
    }

    return { forState, forStateFn, forDispatch };
}

function partialWith<Arg extends any, OtherArgs extends any[], Result extends any>(
    fn: Func<Result, [Arg, ...OtherArgs]>,
    arg: Arg
) {
    function inner(...otherArgs: OtherArgs) {
        return fn(arg, ...otherArgs);
    }
    return <Func<Result, [...OtherArgs]>>inner;
}

// TODO: Make better and Add to ts-util-types

type Dispatch<State extends any> = React.Dispatch<React.SetStateAction<State>>;
type PartialFn<Args extends any, OtherArgs extends any[], R extends any> = Func<
    R,
    [Args, ...OtherArgs]
>;
