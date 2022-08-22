import React from "react";
import { renderToString } from "react-dom/server";
import { Request } from "express";
import App from "./app";

export function renderHtml(req: Request) {
    const mainContent = renderToString(React.createElement(App, { path: req.originalUrl }));
    return getFullHtml(mainContent);
}

function getFullHtml(mainContent: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <link rel="icon" href="static/favicon.ico" />
      <link rel="stylesheet" type="text/css" href="static/client-bundle.style.css">
      <title>Node SSR</title>
    </head>
    <body>
       <div id="root">${mainContent}</div>
       <script src="client-bundle.js"></script>
    </body>
    </html>
`;
}

export default App;
