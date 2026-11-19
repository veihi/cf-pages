---
layout: home
---

欢迎来到我的网站。分享一些有趣的事情。

<style>
/*
 * The promotion is deliberately outside the article flow.
 * It occupies the right-side whitespace on wide desktop screens only.
 */
.home-promo-sidebar {
  position: fixed;
  z-index: 20;
  top: 150px;
  right: max(16px, calc((100vw - 800px) / 2 - 320px));
  width: 300px;
  height: 250px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
}
.home-promo-sidebar iframe {
  display: block;
  width: 300px;
  height: 250px;
  border: 0;
  margin: 0;
  padding: 0;
}
/* Never squeeze the blog or cover content on smaller screens. */
@media (max-width: 1499px) {
  .home-promo-sidebar {
    display: none;
  }
}
</style>

<aside class="home-promo-sidebar" aria-label="星陨计划 Ark Re:Code 推广广告">
  <iframe
    title="星陨计划 Ark Re:Code 推广横幅"
    src="https://www.ero-labs.com/adIframe/?code=promotion&amp;lang=cn&amp;adType=4&amp;gameId=32&amp;url=https://game.erolabsshare.live/app/bb37ff57/Ark_Re_Code&amp;type=ad"
    width="300"
    height="250"
    frameborder="0"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</aside>
