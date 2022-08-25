import React, { useEffect, useState } from "react";
import { fetchOrderDetail, updatePaymentStatus } from "../../externals/server/air-travel";
import { orderStore } from "../../externals/store";
import { OrderData } from "../../externals/store/store.types";

export function usePaymentSuccessPage() {
    const [orderData, setOrderData] = useState<OrderData>(orderStore.get());

    useEffect(() => {
        orderStore.listen(setOrderData);
        return () => orderStore.unlisten(setOrderData);
    }, []);

    useEffect(() => {
        updatePaymentStatus(orderData.id)
            .then(() => fetchOrderDetail(orderData.id))
            .then((orderData) => {
                setOrderData(orderData);
                orderStore.save(orderData);
            });
    }, [orderData.id]);

    return { orderData };
}
