import ora from "ora";
import crypto from "crypto";
import asyncPool from "tiny-async-pool";
import {
  yellowBright,
  blueBright,
  cyanBright,
  redBright,
  greenBright,
} from "chalk";
import { transformVideo, fetch, input_key, ab2str, hexToBytes } from "./index";
/**
 *
 * @param {*} segments
 * @param {*} newName
 * @param {*} dirPath
 * @param {*} pathVideoDB
 */
export async function download(segments, newName, dirPath, pathVideoDB) {
  try {
    const spinner = ora(`开始下载:${newName}`).start(),
      len = segments.length;
    // 获得ak;
    const ak = await fetch
      .get(segments[0].key.uri, {
        responseType: "arraybuffer",
      })
      .then((data) => input_key(ab2str(data.data)));
    let index = 0,
      flag = false;
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
        spinner.text = `${blueBright("总列表:")}${dirPath}\t${blueBright(
          "下载文件:"
        )}${newName} ${blueBright("下载进度:")}${index++}/${len}`;
        return Buffer.concat([cipher.update(content), cipher.final()]);
      } catch (error) {
        if (!flag) {
          spinner.fail(
            `\r\n${redBright("总列表:")}${dirPath}\t${redBright(
              "下载失败:"
            )}${newName}\r\n`
          );
          flag = true;
        }

        throw error;
      }
    }
    const results = await asyncPool(12, segments, callback);
    const outputData = Buffer.concat(results);

    // await fs.writeFile(pathVideoDB, outputData);
    await transformVideo(pathVideoDB, outputData);
    spinner.stop();
    spinner.succeed(
      `${greenBright("总列表:")}${dirPath}\t${greenBright(
        "下载成功:"
      )}${newName} ${greenBright("下载进度:")}${index}/${len}`
    );
  } catch (error) {
    throw error;
  }
}
