import { OrWithPromise } from "ts-util-types";

type Key = string | number;
type IsFirstObservation = boolean;
export default class InfiniteScrollManager {
    private container!: Element;
    private observer!: IntersectionObserver;
    private itemsWithKeyasKey = new Map<Key, Element>();
    private elmDetails = new Map<Element, [Key, IsFirstObservation]>();
    private aboveView = new Set<Element>();
    private belowView = new Set<Element>();
    private inView = new Array<Element>();
    private currElmKey: Key | undefined;
    private requestAnimationFramId!: number;

    constructor(
        private onItemLeaveUp: (totalNoOfLeavesUp: number) => OrWithPromise<void>,
        private onItemLeaveDown: (totalNoOfLeavesDown: number) => OrWithPromise<void>
    ) {}

    attachChild(key: Key, elm: Element) {
        this.itemsWithKeyasKey.set(key, elm);
        this.elmDetails.set(elm, [key, true]);

        this.observer.observe(elm);
        return () => this.unAttachChild(key, elm);
    }

    setContainer(container: Element) {
        this.container = container;
        this.observer = new IntersectionObserver(this.callback.bind(this), {
            root: this.container,
        });
        return this;
    }

    refresh() {
        this.observer.disconnect();
        this.aboveView.clear();
        this.belowView.clear();
        this.inView = [];

        const iterator = this.itemsWithKeyasKey[Symbol.iterator]();
        for (let item = iterator.next(); !item.done; item = iterator.next()) {
            const [, elm] = item.value;
            this.observer.observe(elm);
        }
        this.moveScrollYToCurrItem();
        return this;
    }

    private unAttachChild(key: Key, elm: Element) {
        this.itemsWithKeyasKey.delete(key);
        this.elmDetails.delete(elm);
        this.observer.unobserve(elm);
    }

    private moveScrollYToCurrItem() {
        this.container.scrollTo(0, this.getCurrScrollYPos());
        return this;
    }

    private getCurrScrollYPos() {
        if (this.currElmKey == null) return 0;
        const currElm = this.itemsWithKeyasKey.get(this.currElmKey);

        if (currElm == null) return 0;
        return (
            this.container.scrollTop +
            this.container.getBoundingClientRect().top -
            currElm.getBoundingClientRect().top
        );
    }

    private callback(entries: IntersectionObserverEntry[]) {
        if (!this.container) return;
        for (let i = 0; i < entries.length; i++) {
            this.handle(entries[i]);
        }
    }

    private handle(entry: IntersectionObserverEntry) {
        if (entry.isIntersecting) this.handleIntersectingEntry(entry);
        else this.handleUnIntersectingEntry(entry);
        const [key] = this.elmDetails.get(entry.target) as [Key, IsFirstObservation];
        this.elmDetails.set(entry.target, [key, false]);
    }

    private handleIntersectingEntry(entry: IntersectionObserverEntry) {
        const elm = entry.target;
        this.aboveView.delete(elm);
        this.belowView.delete(elm);
        this.inView.push(elm);
        this.moveLatestElmToCorrectIndexPos();
        this.setCurrElmKeyAndScrollPos();
    }

    private moveLatestElmToCorrectIndexPos() {
        if (this.inView.length > 1)
            for (let i = this.inView.length - 1; i < -1; i--) {
                const left = this.inView[i - 1];
                const right = this.inView[i];

                if (left.getBoundingClientRect().top > right.getBoundingClientRect().top) {
                    this.inView[i - 1] = right;
                    this.inView[i] = left;
                }
            }
    }

    private setCurrElmKeyAndScrollPos() {
        const topInView = this.inView[0];
        this.currElmKey = this.elmDetails.get(topInView)?.[0];
    }

    private handleUnIntersectingEntry(entry: IntersectionObserverEntry) {
        const isAbove = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        const elm = entry.target;

        if (isAbove) this.handleElmAboveView(elm);
        else this.handleElmBelowView(elm);
    }

    private handleElmAboveView(elm: Element) {
        this.aboveView.add(elm);
        this.belowView.delete(elm);

        for (let i = 0; i < this.inView.length; i++) {
            if (this.inView[i] !== elm) continue;
            this.inView.splice(i, 1);
            break;
        }

        if (this.isFirstObservation(elm)) return;
        this.onItemLeaveUp(this.aboveView.size);
    }

    private handleElmBelowView(elm: Element) {
        this.belowView.add(elm);
        this.aboveView.delete(elm);

        for (let i = this.inView.length - 1; i > -1; i--) {
            if (this.inView[i] !== elm) continue;
            this.inView.splice(i, 1);
            break;
        }
        if (this.isFirstObservation(elm)) return;
        this.onItemLeaveDown(this.aboveView.size);
    }

    private isFirstObservation(elm: Element) {
        return this.elmDetails.get(elm)?.[1];
    }
}
