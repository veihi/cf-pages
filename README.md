# veihi 的数字档案

Astro 静态改版，保留现有 Jekyll 文章和歌单作为内容源。托管平台仍为 Cloudflare Pages，根目录 `.node-version` 指定构建所需的 Node 版本；生产是否生效以部署结果和线上检查为准。

## 本地运行

需要 Node.js 22.23.4 以上（当前开发环境为 24.20.0）。

```sh
npm ci
npm run build
npm run verify
npm run preview
```

预览默认在 `http://127.0.0.1:4321`。修改后重新 `npm run build` 即可刷新预览。

开发时也可 `npm run dev`。文章图片由生产构建的 `postbuild` 从 `assets/` 复制，因此要完整检查既有图片时使用 build + preview。

## 内容与实现

- `_posts/`：原始文章，不需要移动；沿用 `/:categories/:year/:month/:day/:title.html` 地址。
- `_config.yml`：站名、邮箱和网站地址。Astro 读取这些值；Jekyll 相关配置为旧部署保留。
- `_data/music.yml`、`_includes/music-player.html`：继续作为播放器源，构建时只替换 Liquid 数据绑定，不改变原始文件。
- `src/pages/index.astro`：首屏、文章筛选、关于和品牌合作入口。
- `src/styles/global.css`：视觉与响应式设计。
- `src/scripts/particles.js`：原生 WebGL 粒子环；支持减少动态效果、视口外暂停、切换页面后释放资源，WebGL 不可用时显示静态替代图形。
- `src/scripts/navigation.js`：保留原有局部导航结构，播放器在被替换的 `#swup` 内容之外。
- `_redirects`：构建后复制到 `dist/`，四个短链接仍由 Cloudflare Pages 执行。
- `games.md` 及之前暂停的推广都不进入 Astro 的构建输出。

TMT 尚未提供店铺链接、可用优惠码、优惠规则或授权产品图，当前使用真实邮箱作为品牌合作入口，不生成优惠码或认证背书。

## Cloudflare Pages 切换

本地设计确认后，生产项目需要同时调整：

| 设置 | 新值 |
| --- | --- |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| Node.js | `NODE_VERSION=24.20.0`（或满足 package.json engines 的支持版本） |
| 生产分支 | `main` |

静态输出不需要 Cloudflare adapter、Worker 或服务端。不能仅合并源码而继续用 `bundle exec jekyll build`，否则生产仍会运行旧版。切换后检查首页、四篇文章旧地址、RSS、404、短链接的 302，以及播放器和浏览器前进后退。

## 设计参考

参考 [Awwwards 暗色网站目录](https://www.awwwards.com/websites/dark/) 的暗色与动态表现，以及 [SiteInspire 的排版网站](https://www.siteinspire.com/website/13669-type-darkroom) 的字号层次。页面结构、文案、CSS 和 WebGL 均为本项目实现，未复制第三方模板源码、图片或字体。
