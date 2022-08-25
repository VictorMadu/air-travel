import { useRef } from "react";

export function useImmuntable<T extends any>(obj: T) {
    const fetchAndUpdateStateFn = useRef(obj);
    return fetchAndUpdateStateFn.current;
}
