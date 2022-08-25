import React from "react";
import { usePaymentSuccessPage } from "./payment-success-page.hooks";

const PaymentSuccessPage = () => {
    const { orderData } = usePaymentSuccessPage();
    return (
        <div>
            <div>{"Thank you for your order"}</div>
            <div>
                <div>{"Order Details"}</div>
                <div>
                    <div>
                        <p>{"order id"}</p>
                        <p>{orderData.id}</p>
                    </div>
                    <div>
                        <p>{"from"}</p>
                        <p>{orderData.from_airport}</p>
                    </div>

                    <div>
                        <p>{"to"}</p>
                        <p>{orderData.to_airport}</p>
                    </div>

                    <div>
                        <p>{"total"}</p>
                        <p>{orderData.total}</p>
                    </div>

                    <div>
                        <p>{"stripe id"}</p>
                        <p>{orderData.payment_id}</p>
                    </div>
                    <div>
                        <p>{"status"}</p>
                        <p>{orderData.status}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
