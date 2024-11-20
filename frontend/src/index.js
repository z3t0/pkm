import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./style.css";
import * as util from "./util.js";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);