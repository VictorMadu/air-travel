export interface Store<T extends Data> {
    save(data: T): void;
    get(): T;
    delete(): void;
    listen(fn: Listener<T>): void;
    unlisten(fn: Listener<T>): void;
}

export type Data = OrderData;

export interface OrderData {
    id: string;
    from_airport_id: string;
    from_airport: string;
    from_country: string;
    to_airport_id: string;
    to_airport: string;
    to_country: string;
    total: string;
    payment_id: string;
    status: "failed" | "paid";
    payment_url: string;
}

export type Listener<T> = (data: T) => void;
