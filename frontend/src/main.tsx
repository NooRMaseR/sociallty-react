import { LoadingBarContainer } from "react-top-loading-bar";
import { createTheme, ThemeProvider } from "@mui/material";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./utils/store.ts";
// import { StrictMode } from "react";
import App from "./App.tsx";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Check for updates to the service worker
      registration.onupdatefound = () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // A new service worker is installed and waiting
                console.log('New service worker available');

                // Auto-reload the page to activate the new service worker
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              } else {
                // First-time install
                console.log('Service worker installed for the first time');
              }
            }
          };
        }
      };
    });

    // Reload the page when the new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  });
}


createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <LoadingBarContainer props={{color: 'blue', height: 2}}>
        <App />
      </LoadingBarContainer>
    </Provider>
  </ThemeProvider>
  // {/* </StrictMode> */}
);
