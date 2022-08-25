import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/home-page/home-page";
import PageWrapper from "./components/page-wrapper/page-wrapper";
import PaymentFailPage from "./components/payment-fail-page/payment-fail-page";
import PaymentSuccessPage from "./components/payment-success-page";
import "./app.css";

const App = () => {
    return (
        <PageWrapper>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
                <Route path="/payment-fail" element={<PaymentFailPage />} />
                <Route path="*" element={<div>Error Page</div>} />
            </Routes>
        </PageWrapper>
    );
};

export default App;
