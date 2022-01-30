#! /usr/bin/env node
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-syntax-dynamic-import"],
  extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  ignore: [/node_modules/],
  cache: false,
});
require("../scripts");
