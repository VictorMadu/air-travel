import { useRef, useState, useEffect } from "react";

interface Me {
    rootMargin: string;
    threshold: number;
}
export const useIntersectionObserver = ({ rootMargin = "0px", threshold = 0 }: Partial<Me>) => {
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const [entries, setEntries] = useState<any>([]);
    const [observedNodes, setObservedNodes] = useState([]);
    const observer = useRef<any>(null);

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }
        if (!root) return;

        observer.current = new IntersectionObserver((entries) => setEntries(entries), {
            root,
            rootMargin,
            threshold,
        });

        const { current: currentObserver } = observer;

        for (const node of observedNodes) {
            currentObserver.observe(node);
        }

        return () => currentObserver.disconnect();
    }, [observedNodes, root, rootMargin, threshold]);

    return [entries, setObservedNodes, setRoot];
};
