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
