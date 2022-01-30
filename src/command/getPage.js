import cheerio from "cheerio";
import { greenBright } from "chalk";
import { getDir } from "./index";
import { fetch } from "../utils";
/**
 *
 * @param {*} page 当前页码
 * @param {*} PageListIndex 页面列表索引
 */
export async function getPage(page = 0, PageListIndex = 0) {
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
      `\r\n${greenBright("正在下载:")}${++PageListIndex}/${lists.length} ${
        list.name
      }\r\n`
    );
    const id = await fetch
      .get(`http://www.javascriptpeixun.cn${list.id}`)
      .then((data) => {
        const result = data.request.path.match(/\/(\d+)$|targetId=(\d+)/);
        return result[1] || result[2];
      });
    await getDir(id, page);
  }
}
