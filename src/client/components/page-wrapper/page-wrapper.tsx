import React from "react";
import { OrWithArray } from "ts-util-types";
import "./page-wrapper.css";

const PageWrapper = (props: PageWrapperProps) => {
    return <div className="page-wrapper">{props.children}</div>;
};

interface PageWrapperProps {
    children: OrWithArray<React.ReactElement>;
}

export default PageWrapper;
