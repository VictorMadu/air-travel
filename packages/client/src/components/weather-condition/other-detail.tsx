import React from "react";

const OtherDetail = ({ title, content }: OtherDetailProps) => {
    return (
        <div className="wc__other-detail">
            <small className="wc__other-detail__title text-muted">{title}</small>
            <p className="wc__other-detail__content">{content}</p>
        </div>
    );
};

interface OtherDetailProps {
    title: string;
    content: string | number;
}

export default OtherDetail;
