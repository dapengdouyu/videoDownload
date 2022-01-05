const fs = require("fs-extra");
const cheerio = require("cheerio");
const crypto = require("crypto"); //引用AES源码js
const { Parser } = require("./m3u8-parser.cjs");
const fetch = require("./http");
const path = require("path");
const ora = require("ora");
const v2 = require("./v2");
const asyncPool = require("tiny-async-pool");
const {blue,red,green,greenBright} = require('chalk');
let pathVideoDB = "",
  AllIndex = 0,
  AllLen = 0;
function handleHTml(html) {
  let $ = cheerio.load(html, { ignoreWhitespace: true });
  const videoContext = $("#lesson-video-content");
  return [
    videoContext.attr("data-file-global-id"),
    videoContext.attr("data-token"),
  ];
}
function getVideoUrl(fid, token) {
  return `https://play.qiqiuyun.net/sdk_api/play?resNo=${fid}&token=${token}&ssl=1&sdkType=js&lang=zh-CN&callback=`;
}
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

async function init(url, newName) {
  try {
    const html = await fetch.get(url).then((data) => data.data);
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
    await download(segments, newName);
  } catch (error) {
    console.log("下载失败...", error.message);
  }
}
async function download(segments, newName) {
  const spinner = ora(`开始下载:${newName}`).start(),
    len = segments.length;
  // 获得ak;
  const ak = await fetch.get(segments[0].key.uri).then((data) => v2(data.data));
  let index = 0;
  async function callback(line) {
    try {
      const key = line.key;
      const ts_uri = line.uri;
      let iv = Buffer.from(hexToBytes(key.iv));
      const content = await fetch
        .get(ts_uri, { responseType: "arraybuffer" })
        .then((data) => data.data);
      const cipher = crypto.createDecipheriv("aes-128-cbc", ak, iv);
      cipher.on("error", (error) => {
        throw error;
      });
      spinner.text = `${blue('总列表:')}${AllIndex}/${AllLen}\t${blue('下载文件:')}${newName} ${greenBright('下载进度:')}${index++}/${len}`;
      return Buffer.concat([cipher.update(content), cipher.final()]);
    } catch (error) {
      spinner.fail(`${blue('总列表:')}${AllIndex}/${AllLen}\t${red('下载失败:')}${newName}`);
    }
  }
  const results = await asyncPool(20, segments, callback);
  const outputData = Buffer.concat(results);
  await fs.writeFile(pathVideoDB, outputData);
  spinner.stop();
  spinner.succeed(
    `${blue('总列表:')}${AllIndex}/${AllLen}\t${greenBright('下载成功:')}${newName} ${greenBright('下载进度:')}${index}/${len}`
  );
}
async function getDir(cid = "") {
  try {
    
    const url = `http://www.javascriptpeixun.cn/course/${cid}`;
    const htmlTitle = await fetch
    .get(`${url}`)
    .then((data) => data.data);
    const dir = cheerio.load(htmlTitle, { ignoreWhitespace: true })('.breadcrumb .active').text().trim();
    const html = await fetch
      .get(`${url}/task/list/render/default`)
      .then((data) => data.data);
    let $ = cheerio.load(html, { ignoreWhitespace: true }),
      chapter = "",
      unit = "",
      CIndex = 0;
    const baseUrl = path.join(__dirname, "../珠峰架构",dir);
    const videoContext = JSON.parse($(".js-hidden-cached-data").text());
    AllLen = videoContext.length;
    for (let item of videoContext) {
      AllIndex++;
      const { type, status, title, taskId } = item;
      if (type === "video") {
        const newTitle = `课程${++CIndex}_${title}.ts`;
        pathVideoDB = path.join(baseUrl, unit, newTitle);
        if (fs.existsSync(path.join(baseUrl, unit, newTitle))) {
          console.log(`${blue('总列表:')}${AllIndex}/${AllLen}\t${blue('课程已存在:')}${newTitle}`);
          continue;
        }
        if (status !== "published") {
          console.log(`${blue('总列表:')}${AllIndex}/${AllLen}\t${blue('课程未发布')}:${newTitle}`);
          continue;
        }
        await init(
          `http://www.javascriptpeixun.cn/course/${cid}/task/${taskId}/activity_show`,
          newTitle
        );
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
        console.log(`${blue('总列表:')}${AllIndex}/${AllLen}\t${blue('非文件')}:${unit}`);
        await fs.ensureDir(pathVideoDB);
      }
    }
  } catch (error) {
    console.log("报错", error.message.data);
  }
}

getDir("2024");
