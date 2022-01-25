const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Readable } = require("stream");
const ffmpegPath = require("ffmpeg-static").replace(/app.asar[\/\\]{1,2}/g, ""); //文件地址
const cheerio = require("cheerio");
const crypto = require("crypto"); //引用AES源码js
const { Parser } = require("m3u8-parser");
const fetch = require("./http");
const path = require("path");
const ora = require("ora");
const v2 = require("./v2");
const asyncPool = require("tiny-async-pool");
const {
  yellowBright,
  blueBright,
  cyanBright,
  redBright,
  greenBright,
} = require("chalk");
const VIDEO_TYPE = "mp4";
let pathVideoDB = path.join(__dirname,'../珠峰架构/默认目录','45.vite实战.mp4'),
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
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
async function init(url, newName) {
  try {
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
        `${redBright("总列表:")}${AllIndex}/${AllLen}\t${redBright(
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
    await download(segments, newName);
  } catch (error) {
    console.log("下载失败...", error.message);
  }
}
async function download(segments, newName) {
  try {
    const spinner = ora(`开始下载:${newName}`).start(),
      len = segments.length;
    // 获得ak;

    const ak = await fetch
      .get(segments[0].key.uri, {
        responseType: "arraybuffer",
      })
      .then((data) => v2(ab2str(data.data)));
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
        spinner.text = `${blueBright(
          "总列表:"
        )}${AllIndex}/${AllLen}\t${blueBright(
          "下载文件:"
        )}${newName} ${blueBright("下载进度:")}${index++}/${len}`;
        return Buffer.concat([cipher.update(content), cipher.final()]);
      } catch (error) {
        spinner.fail(
          `${redBright("总列表:")}${AllIndex}/${AllLen}\t${redBright(
            "下载失败:"
          )}${newName}`
        );
      }
    }
    const results = await asyncPool(12, segments, callback);
    const outputData = Buffer.concat(results);
    // await fs.writeFile(pathVideoDB, outputData);
    await transformVideo(pathVideoDB, outputData);
    spinner.stop();
    spinner.succeed(
      `${greenBright("总列表:")}${AllIndex}/${AllLen}\t${greenBright(
        "下载成功:"
      )}${newName} ${greenBright("下载进度:")}${index}/${len}`
    );
  } catch (error) {
    throw error;
  }
}
async function transformVideo(pathVideoDB, outputData) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(ffmpegPath)) {
      let ffmpegInputStream = new FFmpegStreamReadable(null);
      new ffmpeg(ffmpegInputStream)
        .setFfmpegPath(ffmpegPath)
        .videoCodec("copy")
        .audioCodec("copy")
        .format(VIDEO_TYPE)
        .save(pathVideoDB)
        .on("error", (error) => {
          reject(error);
        })
        .on("end", function () {
          resolve("success");
        });
      ffmpegInputStream.push(outputData);
      while (ffmpegInputStream._readableState.length > 0) {
        await sleep(100);
      }
      ffmpegInputStream.push(null);
    } else {
      reject("未发现本地FFMPEG，不进行合成。");
    }
  });
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class FFmpegStreamReadable extends Readable {
  constructor(opt) {
    super(opt);
  }
  _read() {}
}
async function getDir(cid = "") {
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
      unit = "",
      CIndex = 0;
    const baseUrl = path.join(__dirname, "../珠峰架构", `${cid} ${dir}`);
    await fs.ensureDir(baseUrl);
    const videoContext = JSON.parse($(".js-hidden-cached-data").text());
    AllLen = videoContext.length;
    for (let item of videoContext) {
      AllIndex++;
      const { type, status, title, taskId } = item;
      if (type === "video") {
        const newTitle = `课程${++CIndex}_${title}.${VIDEO_TYPE}`;
        pathVideoDB = path.join(baseUrl, unit, newTitle);
        if (fs.existsSync(path.join(baseUrl, unit, newTitle))) {
          console.log(
            `${yellowBright("总列表:")}${AllIndex}/${AllLen}\t${yellowBright(
              "课程已存在:"
            )}${newTitle}`
          );
          continue;
        }
        if (status !== "published") {
          console.log(
            `${yellowBright("总列表:")}${AllIndex}/${AllLen}\t${yellowBright(
              "课程未发布"
            )}:${newTitle}`
          );
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
        console.log(
          `${cyanBright("总列表:")}${AllIndex}/${AllLen}\t${cyanBright(
            "非文件"
          )}:${unit}`
        );
        await fs.ensureDir(pathVideoDB);
      }
    }
  } catch (error) {
    console.log("报错", error.message);
  }
}

async function getPage(page = 0) {
  const url = `http://www.javascriptpeixun.cn/my/courses/learning?page=${page}`;
  const htmlTitle = await fetch.get(`${url}`).then((data) => data.data);
  const $ = cheerio.load(htmlTitle, { ignoreWhitespace: true });
  const lists = $(".cd-link-major")
    .map(function (i, item) {
      return { name: $(this).text(), id: $(item).attr("href") };
    })
    .toArray();
  for (let list of lists) {
    console.log(`\r\n${yellowBright("正在下载:")}${list.name}\r\n`);
    AllIndex = 0;
    const id = await fetch
      .get(`http://www.javascriptpeixun.cn${list.id}`)
      .then((data) => data.request.path.split("/")[2]);
    await getDir(id);
  }
}
getPage(4);
