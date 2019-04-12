import React from "react";
import ReactDOM from "react-dom";
import TranslateContainer from "./components/TranslateContainer";

document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate'></div>");
ReactDOM.render(<TranslateContainer />, document.getElementById("simple-translate"));
