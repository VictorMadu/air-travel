import React from "react";
import "./error-page.css";

const ErrorPage = ({ title }: ErrorPageProps) => {
    return (
        <div className="ep">
            <h3>{title}</h3>
        </div>
    );
};

interface ErrorPageProps {
    title: string;
}

export default ErrorPage;
