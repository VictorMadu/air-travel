var path = require("path");
var exec = require("child_process").exec;
var { CleanWebpackPlugin } = require("clean-webpack-plugin");
var DeclarationBundlerPlugin = require("declaration-bundler-webpack-plugin");
var BundleDeclarationsWebpackPlugin = require("bundle-declarations-webpack-plugin");
var WebpackShellPlugin = require("webpack-shell-plugin");
var webpackNodeExternals = require("webpack-node-externals");
var UglifyJSPlugin = require("uglifyjs-webpack-plugin");

var entryFile = "./src/server/index.ts";

module.exports = {
    target: "node",
    externalsPresets: { node: true },
    mode: process.env.NODE_ENV,
    externals: [webpackNodeExternals()],
    entry: {
        index: entryFile,
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        // chunkFilename: "[name].js",
        libraryTarget: "commonjs",
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader", "ts-loader"],
                // loader: "ts-loader",
            },
            {
                test: /\.(css|scss)$/,
                loader: "ignore-loader",
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
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.join(__dirname, "dist/**/*")],
        }),

        new UglifyJSPlugin(),
        new BundleDeclarationsWebpackPlugin({
            entry: {
                filePath: entryFile,
            },
            outFile: "index.d.ts",
        }),
        // new WebpackShellPlugin({
        //     onBuildEnd: ["yarn run:dev"],
        // }),
        // new CopyWebpackPlugin({
        //     patterns: [
        //         {
        //             from: "./package.json",
        //             to: "../dist/package.json",
        //         },
        //     ],
        //     options: {
        //         concurrency: 100,
        //     },
        // }),
        // new TypedocWebpackPlugin({
        //     out: "docs",
        // }),
    ],

    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
    },
};

// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin");
// const TypedocWebpackPlugin = require("typedoc-webpack-plugin");
