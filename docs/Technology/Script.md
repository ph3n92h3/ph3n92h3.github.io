# Script

## Change `cn.bing` to `global.bing` in China Mainland

1. 清理浏览器 Cookie
2. 添加搜索引擎: `https://global.bing.com/search?q=%s&setmkt=en-US&setlang=en`
3. 将该搜索引擎设置为默认搜索引擎

## 微信读书网页端

```js
// ==UserScript==
// @name         微信读书
// @match        https://weread.qq.com/web/reader/*
// @icon         https://weread.qq.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle("*{font-family: Noto Serif CJK SC; font-weight: bold;}");
GM_addStyle(".wr_whiteTheme .readerContent .app_content{background-color: rgba(241,229,201,1) !important;}"); //(199,237,204,1)
GM_addStyle(".wr_whiteTheme .readerTopBar {background-color: rgba(60,179,113,1) !important;}");
// GM_addStyle(".wr_whiteTheme {background-color: rgba(240,255,240,1) !important;}");

GM_addStyle(".readerContent .app_content, .readerTopBar {max-width: 100%;}")
```
