import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";

const App = (props: AppProps) => {
    return (
        <StaticRouter location={props.path}>
            <Routes>
                <Route path="/" element={<div>Hello world2</div>} />
                <Route path="*" element={<div>Error Page</div>} />
            </Routes>
        </StaticRouter>
    );
};

interface AppProps {
    path: string;
}

export default App;
