import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/bili': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward X-Bili-Cookie as Cookie
            const cookie = req.headers['x-bili-cookie'];
            if (cookie) {
              proxyReq.setHeader('Cookie', cookie);
            }
            proxyReq.setHeader('Referer', 'https://www.bilibili.com');
            proxyReq.setHeader('Origin', 'https://www.bilibili.com');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          });
        }
      },
      '/dingtalk': {
        target: 'https://oapi.dingtalk.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dingtalk/, '')
      }
    }
  }
})
