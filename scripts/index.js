import program from "commander";
import pkg from "../package.json";
import "../src";
import { getVideo, getPage, getDir, mountConfig } from "../src/command";
program.version(pkg.version);
program.on("command:*", function (operands) {
  console.log(`dw-cli: command not found: ${operands[0]}`);
  process.exitCode = 1;
});
program
  .command("page [page]")
  .description("下载哪一页的视频")
  .action(async function (page = 1) {
    await getPage(page);
  });
program
  .command("dir [cid]")
  .description("下载哪一目录的视频")
  .action(async function (dir = "2033") {
    await getDir(dir);
  });
program
  .command("video [cid_taskid] [newName]")
  .description("下载哪一个视频")
  .action(async function (cid_taskid = "2033_120600", newName = "a.mp4") {
    await getVideo(cid_taskid, newName);
  });
program
  .command("mount [page]")
  .description("生成配置文件和补丁包")
  .action(async function (page = "1") {
    await mountConfig(page);
  });
process.on("unhandledRejection", function (reason) {
  console.error(reason);
});

program.parse(process.argv);
