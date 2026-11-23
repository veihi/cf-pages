import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { posts, site, music } from '../src/lib/content.js';

const html = fs.readFileSync('dist/index.html', 'utf8');
assert.ok(html.includes(site.title));
assert.ok(html.includes('particle-canvas'));
assert.ok(posts.length > 0);
for (const post of posts) {
  const output = fs.readFileSync(path.join('dist', post.url), 'utf8');
  assert.ok(output.includes(post.title), `Missing post: ${post.url}`);
  assert.ok(html.includes(post.url), `Missing archive link: ${post.url}`);
  assert.ok(!output.includes('{{') && !output.includes('{%'), 'Unrendered Liquid');
  assert.ok(output.includes('id="music-frame"'));
}
const playlist = html.match(/<script id="music-playlist" type="application\/json">([\s\S]*?)<\/script>/);
assert.deepEqual(JSON.parse(playlist[1]), music, 'Playlist differs from existing YAML');
const contact = html.match(/<script id="site-contact" type="application\/json">([\s\S]*?)<\/script>/);
assert.deepEqual(JSON.parse(contact[1]), { email: site.email }, 'Configured public contact email differs');
assert.equal((html.match(/data-contact-email/g) || []).length, 4, 'Contact links must all support partial navigation');
assert.equal(fs.readFileSync('dist/_redirects', 'utf8'), fs.readFileSync('_redirects', 'utf8'));
assert.ok(fs.existsSync('dist/assets/ganyu.jpg'));
assert.ok(fs.existsSync('dist/feed.xml'));
assert.ok(fs.existsSync('dist/404.html'));
for (const item of ['games', 'games.html', 'games.md', 'docs', 'AGENTS.md', '_config.yml', 'node_modules', 'src']) {
  assert.ok(!fs.existsSync(path.join('dist', item)), `Private/unpublished output: ${item}`);
}
assert.ok(!/ero-labs|erolabsshare/.test(html), 'Paused promotion leaked');
for (const match of html.matchAll(/href="(\/(?!\/)[^"#?]*)"/g)) {
  const url = match[1];
  assert.ok(url === '/' || fs.existsSync(path.join('dist', url)), `Broken internal link: ${url}`);
}
console.log(`Verified ${posts.length} legacy article URLs, unchanged playlist, internal links, assets, RSS, 404, redirects and unpublished-content exclusions.`);
