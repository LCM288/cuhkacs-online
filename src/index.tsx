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
import reportWebVitals from "reportWebVitals";
import App from "app";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
