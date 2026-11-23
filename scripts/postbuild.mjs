import { cpSync, copyFileSync } from 'node:fs';
cpSync('assets', 'dist/assets', { recursive: true });
copyFileSync('_redirects', 'dist/_redirects');
console.log('Copied existing article assets and all fixed Cloudflare redirects.');
