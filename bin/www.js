#! /usr/bin/env node
const path=require("path");
const resolve=(package)=>path.join(__dirname,'..','node_modules',package)
require("@babel/register")({
  presets: [resolve("@babel/preset-env"), resolve("@babel/preset-typescript")],
  plugins: [resolve("@babel/plugin-transform-runtime"), resolve("@babel/plugin-syntax-dynamic-import")],
  extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  ignore: [/node_modules/],
  cache: false,
});
require("../scripts");
