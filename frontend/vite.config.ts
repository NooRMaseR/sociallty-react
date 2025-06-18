import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { DEBUG } from "./src/utils/constants";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: DEBUG
      },
      strategies: 'generateSW',
      manifest: {
        "name": "Sociallty",
        "short_name": "Sociallty",
        "description": "Find and stay up to date for today's posts like, share, comment",
        "id": "/",
        "start_url": "/",
        "scope": "/",
        "orientation": "portrait",
        "categories": ["social", "communication"],
        "icons": [
          {
            "src": "/web-app-manifest-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any",
          },
          {
            "src": "/web-app-manifest-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/web-app-manifest-360x360.png",
            "sizes": "360x360",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/web-app-manifest-256x256.png",
            "sizes": "256x256",
            "type": "image/png",
            "purpose": "any"
          }
        ],
        "screenshots": [
          {
            "src": "/Screenshot-Desktop.png",
            "sizes": "931x1023",
            "type": "image/png",
            "label": "Sociality website Desktop style",
            "form_factor": "wide"
          },
          {
            "src": "/Screenshot-Mobile.png",
            "sizes": "502x1008",
            "type": "image/png",
            "label": "Sociality website Mobile style"
          },
          {
            "src": "/Screenshot-Desktop.png",
            "sizes": "931x1023",
            "type": "image/png",
            "label": "Sociality website Desktop style",
          },
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone",
        "shortcuts": [
          {
            "name": "My Profile",
            "short_name": "Profile",
            "url": "/social-user-profile",
            "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
          },
          {
            "name": "My Friends",
            "short_name": "Friends",
            "url": "/see-user-friends",
            "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
          },
          {
            "name": "Chats",
            "short_name": "chats",
            "url": "/chat",
            "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
          },
          {
            "name": "Add a New Post",
            "short_name": "New Post",
            "url": "/make-post",
            "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
          },
          {
            "name": "Settings",
            "short_name": "Settings",
            "url": "/user/settings",
            "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
          }
        ],
      },
    })
  ],
})


