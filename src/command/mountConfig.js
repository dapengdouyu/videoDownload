import cheerio from "cheerio";
import path from 'path';
import { greenBright } from "chalk";
import fs from 'fs-extra'
import { fetch } from "../utils";
import { yellowBright, cyanBright } from "chalk";

import { cwd, VIDEO_TYPE } from "../const";
/**
 *
 * @param {*} page 当前页码
 * @param {*} PageListIndex 页面列表索引
 */
export async function mountConfig(page = 0, PageListIndex = 0) {
  const url = `http://www.javascriptpeixun.cn/my/courses/learning?page=${page}`;
  const htmlTitle = await fetch.get(`${url}`).then((data) => data.data);
  const $ = cheerio.load(htmlTitle, { ignoreWhitespace: true });
  const lists = $(".cd-link-major")
    .map(function (i, item) {
      return { name: $(this).text(), id: $(item).attr("href") };
    })
    .toArray();
  for (let list of lists) {
    console.log(
      `\r\n${greenBright("正在生成配置文件:")}${++PageListIndex}/${lists.length} ${
        list.name
      }\r\n`
    );
    const cid = await fetch
    .get(`http://www.javascriptpeixun.cn${list.id}`)
    .then((data) => {
      const result = data.request.path.match(/\/(\d+)$|targetId=(\d+)/);
      return result[1] || result[2];
    });
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
      dirIndex = 0,
      CINDEX = 0,
      chapter = "",
      unit = "",pathVideoDB='';
    const baseUrl = path.join(cwd, "珠峰架构", `第${page}页`, `${cid} ${dir}`);
    const configUrl = path.join(baseUrl, "config.json");
    const remoteconfigUrl = path.join(baseUrl, "Remoteconfig.json");
    await fs.ensureFile(configUrl);
    await fs.ensureFile(remoteconfigUrl);
    let configObj = {},
      remoteObj = {};
    const videoContext = JSON.parse($(".js-hidden-cached-data").text());
    const dirCount = videoContext.length;
    for (let item of videoContext) {
      dirIndex++;
      const { type, status, title, taskId } = item;
      if (type === "video") {
        const newTitle = `课程${++CINDEX}_${title}.${VIDEO_TYPE}`;
        pathVideoDB = path.join(baseUrl, unit, newTitle);
        if (status !== "published") {
          console.log(
            `${yellowBright("总列表:")}${dirCount}/${dirCount}\t${yellowBright(
              "课程未发布"
            )}:${newTitle}`
          );
          continue;
        }
        console.log(`${cyanBright('更新课程')}\t${newTitle}`)
        remoteObj[`${cid}_${taskId}`] = path.relative(cwd, pathVideoDB);
        if (fs.existsSync(path.join(baseUrl, unit, newTitle))) {
          configObj[`${cid}_${taskId}`] = path.relative(cwd, pathVideoDB);
          continue;
        }
        await fs.writeFile(configUrl, JSON.stringify(configObj, null, 2));
        await fs.writeFile(remoteconfigUrl, JSON.stringify(remoteObj, null, 2));
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
      }
    }
  }
}
