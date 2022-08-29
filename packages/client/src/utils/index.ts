import memoize from "./memoize";
import NeededDataGetterImpl, { NeededDataGetterWithMemoImpl } from "./needed-data-getter";

export type {
    NeededDataGetter,
    NeededDataGetterWithMemo,
    NeededDataGetterCtx,
} from "./needed-data-getter.types";
export { default as InfiniteScrollManager } from "./infinite-scroll-manager";

export const neededDataGetter = new NeededDataGetterImpl();
export const neededDataGetterWithMemo = new NeededDataGetterWithMemoImpl(neededDataGetter, memoize);
