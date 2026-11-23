import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://veihi.uk',
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
});
