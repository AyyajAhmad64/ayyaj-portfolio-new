import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Ensures sitemap.xml, robots.txt, and index.html in the dist build
 * automatically align with VITE_SITE_URL when deploying to Netlify
 * or a custom domain, with fallback to https://ayyajahmad64.github.io.
 */
function productionDomainPlugin(siteUrl) {
  const defaultDomain = 'https://ayyajahmad64.github.io';
  const targetDomain = siteUrl ? siteUrl.replace(/\/+$/, '') : defaultDomain;

  return {
    name: 'production-domain-plugin',
    transformIndexHtml(html) {
      if (targetDomain === defaultDomain) return html;
      return html.replaceAll(defaultDomain, targetDomain);
    },
    closeBundle() {
      if (targetDomain === defaultDomain) return;
      const distDir = path.resolve(__dirname, 'dist');
      const filesToUpdate = ['sitemap.xml', 'robots.txt'];

      for (const file of filesToUpdate) {
        const filePath = path.join(distDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const updated = content.replaceAll(defaultDomain, targetDomain);
          fs.writeFileSync(filePath, updated, 'utf8');
        }
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL || process.env.VITE_SITE_URL;

  return {
    plugins: [
      react(),
      productionDomainPlugin(siteUrl)
    ],
    server: {
      port: 3000,
      open: false
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js']
          }
        }
      }
    }
  };
});
