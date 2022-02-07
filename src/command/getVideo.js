import { Parser } from "m3u8-parser";
import path from "path";
import fs from "fs-extra";
import cheerio from "cheerio";
import { redBright } from "chalk";
import { handleHTml, getVideoUrl, fetch } from "../utils";
import { cwd } from "../const";
import { download } from "../utils";
/**
 *
 * @param {*} url 下载地址
 * @param {*} newName 文件名称
 * @param {*} dirPath 当前视频下载进度
 * @param {*} pathVideoDB 当前视频下载路径
 * @returns
 */
export async function getVideo(
  cid_taskid = "",
  newName = "a.mp4",
  dirPath = "1/1",
  pathVideoDB = path.join(cwd, `珠峰架构/默认目录/${newName}`)
) {
  try {
    await fs.ensureDir(path.dirname(pathVideoDB));
    const url = `http://www.javascriptpeixun.cn/course/${
      cid_taskid.split("_")[0]
    }/task/${cid_taskid.split("_")[1]}/activity_show`;
    const html = await fetch.get(url).then((data) => data.data);
    const flag = cheerio
      .load(html, { ignoreWhitespace: true })(html)
      .text()
      .replace(/\s/g, "");
    if (
      flag === "珠峰培训-PoweredByEduSoho抱歉，视频文件不存在，暂时无法学习。"
    ) {
      await fs.writeFile(pathVideoDB, "抱歉，视频文件不存在，暂时无法学习。");
      console.log(
        `${redBright("总列表:")}${dirPath}\t${redBright(
          "下载失败:"
        )}${newName} ${redBright("视频文件不存在，暂时无法学习")}`
      );
      return;
    }
    const [fid, token] = handleHTml(html);
    const VideoUrl = getVideoUrl(fid, token);
    const res = await fetch.get(VideoUrl).then((data) => data.data);
    const { playlist } = res.args;
    // 获取文件
    const list = await fetch.get(playlist).then((data) => data.data);
    let parser = new Parser();
    parser.push(list);
    parser.end();
    const uri = parser.manifest.playlists[0].uri;
    const ts = await fetch.get(uri).then((data) => data.data);
    parser = new Parser();
    parser.push(ts);
    parser.end();
    const segments = parser.manifest.segments;
    await download(segments, newName, dirPath, pathVideoDB);
  } catch (error) {
    console.log("下载失败...", error.message);
  }
}
