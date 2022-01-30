import cheerio from "cheerio";
export function handleHTml(html) {
  let $ = cheerio.load(html, { ignoreWhitespace: true });
  const videoContext = $("#lesson-video-content");
  return [
    videoContext.attr("data-file-global-id"),
    videoContext.attr("data-token"),
  ];
}
export function getVideoUrl(fid, token) {
  return `https://play.qiqiuyun.net/sdk_api/play?resNo=${fid}&token=${token}&ssl=1&sdkType=js&lang=zh-CN&callback=`;
}
export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2){
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  
  return bytes;
}
export function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
