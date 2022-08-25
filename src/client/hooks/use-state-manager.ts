import { useState } from "react";

export function useStateManager<T extends unknown>(initialState: T) {
    const [state, setState] = useState<T>(initialState);
    return { state, setState };
}
