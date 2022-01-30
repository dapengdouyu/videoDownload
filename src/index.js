import fs from "fs-extra";
import path from "path";
// 加载默认配置
(function () {
  const cwd = process.cwd();
  const isEnvFile = fs.existsSync(path.join(cwd, ".env"));
  if (isEnvFile) {
    require("dotenv").config({ path: path.join(cwd, ".env") });
  } else {
    require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  }
})();
