import NullLocalStorage from "./null-local-storage";
import { StoreImpl } from "./store";
import { StoreManagerImpl } from "./store-manager";
import { OrderData } from "./store.types";

const rootName = "__root";
const orderStoreName = "order";

const storeManager = new StoreManagerImpl(rootName, function () {
    if (typeof window !== "undefined") return localStorage;
    return new NullLocalStorage();
});

export const nullOrderData: OrderData = {
    id: "",
    from_airport_id: "",
    from_airport: "",
    from_country: "",
    to_airport_id: "",
    to_airport: "",
    to_country: "",
    total: "",
    payment_id: "",
    status: "failed",
    payment_url: "",
};

export const orderStore = new StoreImpl<OrderData>(storeManager, orderStoreName, nullOrderData);
