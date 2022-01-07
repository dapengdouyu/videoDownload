const { default: axios } = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cookie = fs.readFileSync(path.join(__dirname, "./ cookie"), "utf-8");

const instance = axios.create({
  headers: {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 ",
  },
});
// instance.defaults.timeout = 10000;
module.exports = instance;
