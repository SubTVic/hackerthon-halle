import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./ui/App";
import { MockInbox } from "./ui/MockInbox";
import "./ui/styles.css";
import "./ui/inbox-demo.css";

const showInboxDemo = window.location.hash === "#inbox";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {showInboxDemo ? <MockInbox /> : <App />}
  </React.StrictMode>,
);
