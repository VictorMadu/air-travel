const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./src/client/index.tsx",
    mode: process.env.NODE_ENV,
    output: {
        filename: "client-bundle.js",
        path: path.resolve(__dirname, "public"),
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "client-bundle.style.css",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.scss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.(jpg|png|svg|gif|pdf)$/,
                loader: "file-loader",
                options: {
                    name: "[path][name].[ext]",
                },
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
};
