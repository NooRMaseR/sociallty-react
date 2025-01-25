import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./utils/store.ts";
// import { StrictMode } from "react";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // {/* </StrictMode> */}
);
