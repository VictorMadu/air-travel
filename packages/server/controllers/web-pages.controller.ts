import express from "express";
import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { renderToString } from "react-dom/server";
import { Request } from "express";
import appRootPath from "app-root-path";
// import App from "../../client/app";
import { configManager } from "../services/_utils";
import path from "path";
import { assetsService } from "../services/assets";

const router = express.Router();

// TODO: Store data in memory for faster sending
// TODO: Create a class or function that refers to asset folder for this and static files route
router.get("*", async (req, res, next) => {
    res.sendFile(assetsService.getClientHTMLFilePath());
});

export default router;

export function renderHtml(req: Request, serverUrl: string) {
    console.log("REQ PATH", req.originalUrl, req.path, req.url);
    throw new Error("Not implemented well");
    const App = <any>{};
    const mainContent = renderToString(
        React.createElement(StaticRouter, {
            location: req.originalUrl,
            children: React.createElement(App),
        })
    );
    return getFullHtml(mainContent, serverUrl);
}

function getFullHtml(mainContent: string, serverUrl: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <link rel="icon" href="/static/favicon.ico" />
      <link rel="stylesheet" type="text/css" href="/static/client-bundle.style.css">
      <title>Air Travel</title>
    </head>
    <body>
       <div id="root">${mainContent}</div>
       <script>
       window.__SERVER_BASE_URL__ = ${JSON.stringify(serverUrl).replace(/</g, "\\u003c")}
     </script>
       <script src="/static/client-bundle.js"></script>
    </body>
    </html>
`;
}
