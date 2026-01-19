import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>

    <ToastContainer position="top-right" autoClose={3000} />
  </Provider>
);
