import { Routes, Route } from "react-router-dom";
import HomePage from "./components/home-page/home-page";
import PageWrapper from "./components/page-wrapper/page-wrapper";
import ErrorPage from "./components/error-page/error-page";
import PaymentSuccessPage from "./components/payment-success-page";
import "./app.css";

const App = () => {
    return (
        <PageWrapper>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
                <Route
                    path="/payment-fail"
                    element={
                        <ErrorPage title={"Sorry, payment failure. Try making payment again"} />
                    }
                />
                <Route path="*" element={<ErrorPage title={"Page not found"} />} />
            </Routes>
        </PageWrapper>
    );
};

export default App;
