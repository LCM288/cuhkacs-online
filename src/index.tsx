import React from "react";
import ReactDOM from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import "bulma/bulma.sass";
import "static/select-fix.css";
import "static/toast-fix.css";
import "static/markdown-edit.css";
import "static/modal-overflowing.css";
import "react-day-picker/lib/style.css";
import "easymde/dist/easymde.min.css";
import "static/day-picker-fix.css";
import reportWebVitals from "reportWebVitals";
import App from "app";
import ConstructionSite from "pages/constructionSite";

const allowedHosts = ["localhost:3000", "localhost:5000", "cuacs.org"];

if (!allowedHosts.includes(window.location.host)) {
  window.location.href = "https://cuacs.org";
}

if (window.location.host === "cuacs.org") {
  ReactDOM.render(
    <React.StrictMode>
      <ConstructionSite />
    </React.StrictMode>,
    document.getElementById("root")
  );
} else {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
