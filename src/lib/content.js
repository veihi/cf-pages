import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { marked } from 'marked';

const root = process.cwd();
export const site = parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
export const music = parse(fs.readFileSync(path.join(root, '_data/music.yml'), 'utf8'));
export const categoryNames = { review: '记录与发现', guide: '使用指南', test: '实验室' };

export const posts = fs.readdirSync(path.join(root, '_posts')).filter(f => f.endsWith('.md')).map(file => {
  const raw = fs.readFileSync(path.join(root, '_posts', file), 'utf8');
  const [, front, body] = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/) || [];
  if (!front) throw new Error(`Missing front matter: ${file}`);
  const data = parse(front);
  const [, year, month, day, slug] = file.match(/^(\d{4})-(\d{1,2})-(\d{1,2})-(.+)\.md$/) || [];
  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const categories = Array.isArray(data.categories) ? data.categories : String(data.categories || '').split(/\s+/).filter(Boolean);
  const route = data.permalink || `/${[...categories, year, month.padStart(2, '0'), day.padStart(2, '0'), `${slug}.html`].join('/')}`;
  const excerpt = body.replace(/<[^>]*>/g, '').replace(/&(?:emsp|ensp|nbsp);/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*`>&]/g, '').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim().slice(0, 95);
  return { ...data, slug, date, categories, url: route, excerpt, html: marked.parse(body), minutes: Math.max(1, Math.ceil(body.length / 600)) };
}).filter(p => p.published !== false && p.date <= new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })).sort((a, b) => b.date.localeCompare(a.date));

export const socialLinks = [
  { label: 'BILIBILI', url: 'https://space.bilibili.com/631367902' },
  { label: '抖音', url: 'https://v.douyin.com/Ua_1nyBq3UI/' },
];
