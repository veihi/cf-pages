# 博客维护交接（Codex / ChatGPT）

## 当前生产版本：Astro（2026-11-23）

PR #16 已合并并通过 Cloudflare Pages 生产部署（代码提交 `e5cd950`）。当前使用 Astro 7 静态网站，设计为近黑色 + 黄绿色、中文大标题、WebGL 粒子环、文章分类筛选和独立合作入口。原 Pages 项目和域名不变，构建命令已切换为 `npm run build`、输出 `dist`，Node 版本由 `.node-version` 指定；详细步骤见根目录 `README.md`。

- 继续读取 `_posts/`、`_config.yml` 与现有歌单；原始文章、歌曲数据及原播放器文件未改动。
- 四篇文章沿用原来的分类 / 日期 / `.html` 路径；保留 RSS、原文章图片、页脚社交链接。
- 新站使用 `src/scripts/navigation.js` 保留 `#swup` 以外的播放器节点；相同页面的首页链接也可回到顶部。
- 之前暂停的 ERO-Labs 推广保持停用，短链接规则继续原样复制。
- TMT 店铺、运营关系与微信企业认证是用户提供的背景，尚未核验；没有将这些背景写成对本站的认证或公开背书，也没有虚构优惠码。
- 新增 npm 相关目录已排除在旧 Jekyll 输出之外；生产切换需要 `npm run build`、输出 `dist` 和符合 engines 的 Node 版本，不能只合并源码。

### 邮箱保护与无刷新导航

Cloudflare 会将 HTML 里的邮箱改写为 `/cdn-cgi/l/email-protection#...`，初次载入后由其脚本解码。但局部导航插入的 HTML 不会重新运行该脚本，因此曾出现从文章返回首页后联系入口跳到 Email Protection 提示页的问题。

`src/scripts/contact.js` 在初始载入和每次 `music:navigation` 后，从布局里的 `application/json` 读取 `_config.yml` 配置的公开联系邮箱，恢复带 `data-contact-email` 标记的链接及邮箱文字。Cloudflare 不改写 script/JSON 内容，站点的邮箱保护设置保持原样。回归检查应覆盖首次载入、文章返回首页、前进/后退及合作区两处和页眉/页脚的邮箱入口。

更新：2026-11-19。依据此前与用户的博客开发会话，并对当前 `main` 的关键文件进行了有限核对。**本文件不替代代码审查**。

## 当前推广状态：暂停

2026-11-19，维护者因合规顾虑要求暂时屏蔽推广。维护者说明链接为星陨计划安全版推广；此次暂停不代表对其合法性作出结论。

- `index.md` 的推广 CSS 和 iframe 已由 Liquid `comment` 包住，构建时不输出到 HTML。
- `games.md` 设置 `published: false`，并在 `_config.yml` 中排除；页面和自动导航入口不再生成，即使用 `--unpublished` 也不会恢复。
- `docs/` 和 `AGENTS.md` 也排除在构建之外，避免含推广地址的维护文档被复制到公开站点。
- 推广源码保留，但未经维护者明确要求不要重新启用。恢复需同时移除首页的 Liquid 注释、页面的 `published: false` 和配置中对 `games.md` 的排除。
- 下文推广部分是暂停前的实现记录。只有合并并完成生产部署后，公开网站才会停用；本地改动不能证明线上已生效。

## 1. 项目与当前情况

- 网站：https://veihi.uk；仓库：`veihi/cf-pages`。
- Jekyll 静态博客，Minima 主题，Cloudflare Pages 托管。
- 生产分支：`main`；日常开发偏好功能分支 → PR → 合并。
- 另一会话已经修改过站点信息、歌单，并增加推广链接。**不要回滚、清理或覆盖这些新内容**；其实现细节不属于本次交接范围。
- 当前检查到 `_config.yml` 的标题为「veihi的档案库」，作者字段为「联系我」，邮箱为 `veihi@veihi.uk`。它们与旧会话中的配置不同，今后应以当前文件为准。
- 当前 `_data/music.yml` 已包含「音游」「VOCALOID / 术力口」「谱面确认」等分类及多首视频，绝对不要用早期只有 Xterfusion 的示例覆盖。

## 2. 文件地图

| 路径 | 作用 |
| --- | --- |
| `_config.yml` | Jekyll 站点信息 |
| `_layouts/default.html` | Minima 页面框架、`#swup` 文章区域、原生 Fetch/History 局部导航 |
| `_includes/music-player.html` | B站悬浮音乐播放器的 HTML/CSS/JS |
| `_data/music.yml` | 分类歌单数据 |
| `_includes/footer-social.html` | 此前加入的 B站/抖音社交跳转（修改前检查当前文件） |
| `_posts/2026-11-12-music-player-guide.md` | 面向访客的播放器使用说明 |
| `index.md` | 首页正文及右侧空白区 ERO-Labs 推广横幅 |
| `games.md` | 游戏推荐独立页面（`/games/`）及 ERO-Labs 博客嵌入素材 |
| `AGENTS.md` | Codex 开发约束 |
| `docs/HANDOFF.md` | 本交接文档 |

## 3. 已完成的主要功能与决策

### 3.1 音乐来源与版权
早期尝试过 R2 自托管 MP3，考虑版权与流量风险后放弃并删除 R2 相关资源，改用 B站官方 iframe（`player.bilibili.com/player.html`），通过 BV 号加载视频。优先使用官方或有授权的视频；官方账号发布不等于无条件授予一切第三方权利。不要把 iframe 替换为未经许可的音频下载或自托管。

### 3.2 播放器
- 桌面端按钮固定左上（现有 CSS 约 `left:18px;top:76px`）；移动端小屏固定右下。
- 点击 ♫ 展开；点击 × 收起。收起只隐藏面板，保留 iframe，不主动暂停。
- 视频需由用户在 B站 iframe 内点击播放；视频自身控制音量、暂停和进度。
- 按分类浏览、进入列表、返回分类；上一首/下一首在当前歌曲所属分类循环。
- 歌单通过 `site.data.music | jsonify` 传入前端，合法 BV 号校验。
- 搜索框位于「音乐分类」与分类数量之间；按歌名做跨分类子串搜索，英文大小写不敏感；点击搜索/Enter 后显示结果，无结果显示提示；返回分类可清空搜索。
- 用户明确要求去掉碍眼的播放说明提示，不要把它重新加进播放器、首页或页脚。
- 已知限制：切换歌曲会重载 iframe，进度重置；不能依赖 B站 iframe 做自动连续切歌。

### 3.3 不间断站内导航
- `_layouts/default.html` 将文章区域标记为 `#swup`，通过 Fetch + History API 局部替换内容（**并未引入 Swup 库**）。
- 页眉、页脚及播放器在替换区域之外；保留 iframe 节点，文章间导航时音乐可继续。
- 实现了前进/后退、滚动位置、标题和部分 metadata 更新，异常时回退普通页面加载。
- 页面刷新、离站、关闭标签页仍会中断。
- 风险：新内容中的内联脚本不会因 `innerHTML` 替换自动执行；页面级复杂交互需额外适配。修改导航时检查链接拦截、锚点、浏览器历史和外链行为。

### 3.4 页脚社交链接
此前在邮箱所在的 Minima 页脚联系列表中增加了 B站和抖音个人主页链接：
- B站：`https://space.bilibili.com/631367902`
- 抖音：`https://v.douyin.com/Ua_1nyBq3UI/`（分享短链，跳转目标未在该会话中验证）
实现方式为独立 include，尽量不覆盖 Minima 自带 footer。其他会话可能已修改页脚，操作前先检查当前实现。

### 3.5 使用文档
创建了 Jekyll 文章 `_posts/2026-11-12-music-player-guide.md`，介绍打开、播放、分类、搜索、切歌、连续播放与常见问题。初次构建后用户未看到文章，后来重新构建一次后确认出现；因此不要认定 Markdown 格式有误。

### 3.6 ERO-Labs 游戏推广（2026-11-19）
- 游戏：星陨计划 Ark Re:Code；来源为用户提供的 ERO-Labs 专属推广材料。推广可能包含成人向游戏内容，面向年满 18 周岁的访客。
- **专属分享地址（不要拼错域名）：** `https://game.erolabsshare.live/app/bb37ff57/Ark_Re_Code`。这里是 `erolabsshare`（双 s），早期实现曾错误写成 `erolabshare`，已纠正。
- 官方 iframe 基础地址：`https://www.ero-labs.com/adIframe/`，其中 `code=promotion&lang=cn&adType=4&gameId=32`，`url` 参数使用上方专属分享地址；HTML 属性中 `&` 应写成 `&amp;`。
- **首页 `index.md`：** 使用 `type=ad` 的 300×250 iframe，通过 `.home-promo-sidebar` 固定在宽屏桌面端的**右侧留白**，不是主内容区。当前 CSS 使用 `top:150px`、`right:max(16px,calc((100vw - 800px)/2 - 320px))`、`z-index:20`；在视口宽度不超过 1499px 时隐藏。广告不应影响文章宽度、文章列表和正文高度。
- **游戏推荐页 `games.md`：** Jekyll Front Matter 设置 `layout:page` 和 `permalink:/games/`；页面含成人内容提示、专属分享按钮和 `type=blog` 的博客 iframe（宽度 100%、高度 110px）。Minima 通过页面标题在顶部导航提供“游戏推荐”入口。
- **版面决策：** 曾尝试将较大的广告卡片放在首页欢迎语与 Posts 列表之间，用户明确否决，因为首页正文是文章干货区域，不应被推广占用。后改为右侧留白广告（对应 PR #12）。后续不要未经用户要求将广告重新塞回主文章流、扩大正文或新增覆盖正文的悬浮层。
- **播放器边界：** 推广功能不应修改 `_includes/music-player.html`、`_data/music.yml` 或站内不间断播放机制；不要让广告遮挡桌面左上音乐入口。
- **注意：** 三方 iframe 是否加载、点击后是否完成推广归因，均需实际浏览器和推广后台验证，代码检查本身不能证明。推广域名或平台材料更新时先核对用户提供的官方内容。

## 4. 歌单格式

```yaml
- name: "音游"
  icon: "🎮"
  tracks:
    - title: "歌曲名称"
      artist: "作者"
      bvid: "BVxxxxxxxxxx"
      # page: 2  # 可选，B站多P视频的第2P；不是播放进度
```

只把以上当作**结构示例**，不是当前完整歌单。修改时读取实际 `_data/music.yml` 并增量编辑，不要重置已有曲目。

## 5. Cloudflare Pages 工作流

用户因频繁 PR 更新消耗构建次数，选择关闭非生产分支的自动 Preview 构建，保留 `main` 的生产部署。此为当时的控制台操作决策，当前设置须在 Cloudflare 重新核对。PR 提交不一定只触发一次构建，分支 push 也可能触发。合并后等待生产部署，再检查站点。

## 6. 回归测试清单

- [ ] 桌面端左上/移动端右下按钮位置正确，不遮挡主要导航。
- [ ] 打开、收起、再次展开时视频不被重建，播放不中断。
- [ ] 分类、返回、跨分类歌名搜索、无结果状态可用。
- [ ] 点击搜索结果与上一首/下一首可以正确选择视频。
- [ ] 在博客内部打开文章、返回首页、浏览器前进后退时，正在播放的视频继续。
- [ ] 地址栏、页面标题、文章链接、锚点、外链正常。
- [ ] 首页文章列表、使用说明文章正常显示；必要时强制刷新排除缓存。
- [ ] 页脚邮箱和 B站/抖音链接正常；推广链接与组件未被误改。
- [ ] 宽屏首页广告只位于右侧留白，不占 Posts 区域；≤1499px 时隐藏，不遮挡播放器和正文。
- [ ] 游戏推荐页 `/games/` 可访问；`type=ad`、`type=blog` iframe 加载正常；分享链接域名为 `erolabsshare.live`（双 s）。
- [ ] Cloudflare Pages 构建/部署成功；没有引入自托管版权音乐。

## 7. 历史 PR（便于追溯）

- #1 B站播放器替换 MP3
- #2 保持播放器的站内局部导航
- #3 两级分类歌单
- #4 播放器提示与位置调整
- #5 页脚位置尝试（后续被纠正）
- #6 恢复播放器位置，调整提示
- #7 删除提示
- #8 页脚 B站/抖音链接
- #9 歌名搜索
- #10 新增 ERO-Labs 游戏推荐页
- #11 首页加入推广横幅并修正分享地址
- #12 将首页横幅改到右侧留白，不再挤占文章

这些 PR 仅作历史线索；**以当前 main 的实际代码为准**。播放器使用说明文章此前直接提交到 main。

## 8. 新会话接手方式

建议 Codex 首轮指令：

> 请先阅读 AGENTS.md 和 docs/HANDOFF.md，再检查当前 main 的关键实现。不要修改其他会话加入的推广链接或无关功能。先总结实际状态与交接文档的差异，再按我提出的单项需求开发，优先使用独立分支和 PR。

遇到交接与代码不一致时，不要擅自恢复旧实现；先向用户说明差异并确认意图。

## 9. 固定短链接（2026-11-20）

用户要求将四个网址包装为本站域名的分享链接。根目录 `_redirects` 配置 Cloudflare Pages 的固定 302 跳转，同时支持以下地址末尾带 `/` 的写法：

| 分享链接 | 目标地址 |
| --- | --- |
| `https://veihi.uk/go/1` | `https://ys.mihoyo.com/` |
| `https://veihi.uk/go/2` | `https://sr.mihoyo.com/` |
| `https://veihi.uk/go/3` | `https://zzz.mihoyo.com/m/main` |
| `https://veihi.uk/go/4` | `https://bh3.mihoyo.com/` |

`_config.yml` 的 `include` 显式纳入 `_redirects`，使 Jekyll 将其复制到构建输出目录，交由 Cloudflare Pages 处理。没有新增内容页或导航入口。短链接只改变点击前的分享地址；跳转后浏览器会显示目标网站域名。

修改目标时编辑对应的两条规则，再完成生产部署。线上验证需检查各地址的 HTTP 状态为 302，且 `Location` 与配置一致；本地 Jekyll 服务本身不会执行 Cloudflare 的重定向规则。
