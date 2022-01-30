import axios from "axios";
export const fetch = axios.create({
  headers: {
    Connection: "keep-alive",
    Cookie: process.env.COOKIE,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 ",
  },
});
