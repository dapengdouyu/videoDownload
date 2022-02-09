import { Parser } from "m3u8-parser";
import path from "path";
import fs from "fs-extra";
import cheerio from "cheerio";
import { yellowBright, cyanBright } from "chalk";
import { fetch } from "../utils";
import { cwd, VIDEO_TYPE } from "../const";
import { getVideo } from "./index";
/**
 *
 * @param {*} cid 目录id
 * @param {*} CINDEX 课程索引
 * @param {*} dirIndex 目录索引
 * @param {*} pathVideoDB 视频地址
 */
export async function getDir(
  cid = "",
  page = 1,
  CINDEX = 0,
  dirIndex = 0,
  pathVideoDB = path.join(cwd, `珠峰架构-${VIDEO_TYPE}/默认目录`)
) {
  try {
    const url = `http://www.javascriptpeixun.cn/course/${cid}`;
    const htmlTitle = await fetch.get(`${url}`).then((data) => data.data);
    const dir = cheerio
      .load(htmlTitle, { ignoreWhitespace: true })("title")
      .text()
      .trim()
      .slice(0, -28);
    const html = await fetch
      .get(`${url}/task/list/render/default`)
      .then((data) => data.data);
    let $ = cheerio.load(html, { ignoreWhitespace: true }),
      chapter = "",
      unit = "";
    const baseUrl = path.join(cwd, `珠峰架构-${VIDEO_TYPE}`, `第${page}页`, `${cid} ${dir}`);
    const configUrl = path.join(baseUrl, "config.json");
    await fs.ensureFile(configUrl);
    await fs.ensureDir(baseUrl);
    let configObj;
    try {
      configObj = require(configUrl);
    } catch (error) {
      configObj = {};
    }
    const videoContext = JSON.parse($(".js-hidden-cached-data").text());
    const dirCount = videoContext.length;
    for (let item of videoContext) {
      dirIndex++;
      const { type, status, title, taskId } = item;
      if (type === "video") {
        const newTitle = `课程${++CINDEX}_${title}.${VIDEO_TYPE}`;
        pathVideoDB = path.join(baseUrl, unit, newTitle);
        if (fs.existsSync(path.join(baseUrl, unit, newTitle))) {
          console.log(
            `${yellowBright("总列表:")}${dirIndex}/${dirCount}\t${yellowBright(
              "课程已存在:"
            )}${newTitle}`
          );
          continue;
        }
        if (status !== "published") {
          console.log(
            `${yellowBright("总列表:")}${dirCount}/${dirCount}\t${yellowBright(
              "课程未发布"
            )}:${newTitle}`
          );
          continue;
        }
        if (
          configObj[`${cid}_${taskId}`] &&
          fs.existsSync(path.join(cwd, configObj[`${cid}_${taskId}`]))
        ) {
          await fs.rename(
            path.join(cwd, configObj[`${cid}_${taskId}`]),
            pathVideoDB
          );
          console.log(
            `${yellowBright("总列表:")}${dirIndex}/${dirCount}\t ${
              configObj[`${cid}_${taskId}`].split("/").slice(-1)[0]
            } ${yellowBright("课程已重置为")}${newTitle}`
          );
          continue;
        }
        await getVideo(
          `${cid}_${taskId}`,
          newTitle,
          `${dirCount}/${dirCount}`,
          pathVideoDB
        );
        configObj[`${cid}_${taskId}`] = path.relative(cwd, pathVideoDB);
        await fs.writeFile(configUrl, JSON.stringify(configObj, null, 2));
      } else {
        unit = title;
        if (type === "chapter") {
          chapter = title;
        }
        if (type === "unit") {
          if (chapter !== "") {
            unit = chapter + "/" + title;
          }
        }
        pathVideoDB = path.join(baseUrl, unit);
        console.log(
          `${cyanBright("总列表:")}${dirIndex}/${dirCount}\t${cyanBright(
            "非文件"
          )}:${unit}`
        );
        await fs.ensureDir(pathVideoDB);
      }
    }
  } catch (error) {
    console.log("报错", error);
  }
}
