import React from "react";
import { usePaymentSuccessPage } from "./payment-success-page.hooks";
import "./payment-success-page.css";

const PaymentSuccessPage = () => {
    const { orderData } = usePaymentSuccessPage();
    return (
        <div className="ps-container">
            <div className="ps">
                <h3>{"Thank you for your order"}</h3>

                <div className="ps__order-detail">
                    <div className="ps__order-detail__section">
                        <p className="ps__order-detail__section__title">{"order id"}</p>
                        <p className="ps__order-detail__section__content">{orderData.id}</p>
                    </div>
                    <div className="ps__order-detail__section">
                        <p className="ps__order-detail__section__title">{"from"}</p>
                        <p className="ps__order-detail__section__content">
                            {orderData.from_airport}
                        </p>
                    </div>
                    <div className="ps__order-detail__section">
                        <p className="ps__order-detail__section__title">{"to"}</p>
                        <p className="ps__order-detail__section__content">{orderData.to_airport}</p>
                    </div>
                    <div className="ps__order-detail__section">
                        <p className="ps__order-detail__section__title">{"total"}</p>
                        <p className="ps__order-detail__section__content">{orderData.total}</p>
                    </div>

                    <div className="ps__order-detail__section">
                        <p className="ps__order-detail__section__title">{"stripe id"}</p>
                        <p className="ps__order-detail__section__content">{orderData.payment_id}</p>
                    </div>
                    <div className="ps__order-detail__section">
                        <p className="ps__order-detail__section__title">{"stripe status"}</p>
                        <p className="ps__order-detail__section__content">{orderData.status}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
