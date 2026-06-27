/* eslint-disable no-undef */
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS to your production deployment URL before deploying via O365.

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";

  // The API base URL is injected at build time so the same code runs against the
  // mock provider locally and the real AskOE API in production.
  const askoeApiBase = process.env.ASKOE_API_BASE || (dev ? "" : "https://api.oxfordeconomics.com/askoe/v1");
  const askoeProvider = process.env.ASKOE_PROVIDER || (dev ? "mock" : "http");

  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      taskpane: ["./src/taskpane/index.tsx"],
      commands: "./src/commands/commands.ts",
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".html"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: { transpileOnly: true },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico|svg)$/,
          type: "asset/resource",
          generator: { filename: "assets/[name][ext][query]" },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "assets/*", to: "assets/[name][ext][query]" },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) return content;
              return content.toString().replace(new RegExp(urlDev.replace(/\/$/, ""), "g"), urlProd.replace(/\/$/, ""));
            },
          },
        ],
      }),
      new webpack.DefinePlugin({
        "process.env.ASKOE_API_BASE": JSON.stringify(askoeApiBase),
        "process.env.ASKOE_PROVIDER": JSON.stringify(askoeProvider),
        "process.env.ADDIN_VERSION": JSON.stringify(require("./package.json").version),
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};
