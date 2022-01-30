import { Readable } from "stream";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { VIDEO_TYPE } from "../const";
const ffmpegPath = ffmpegStatic.replace(/app.asar[\/\\]{1,2}/g, "");
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
class FFmpegStreamReadable extends Readable {
  constructor(opt) {
    super(opt);
  }
  _read() {}
}
export async function transformVideo(pathVideoDB, outputData) {
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
