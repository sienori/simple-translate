import React from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import TranslateContainer from "./components/TranslateContainer";

let isEnabled = true;
const handleMessage = async request => {
  const empty = new Promise(resolve => {
    setTimeout(() => {
      return resolve("");
    }, 100);
  });

  switch (request.message) {
    case "getEnabled":
      return isEnabled;
    case "enableExtension":
      isEnabled = true;
      insertElement();
      break;
    case "disableExtension":
      isEnabled = false;
      removeElement();
      break;
    default:
      return empty;
  }
};
browser.runtime.onMessage.addListener(handleMessage);

const removeElement = () => {
  const element = document.getElementById("simple-translate");
  if (!element) return;
  ReactDOM.unmountComponentAtNode(element);
  element.parentNode.removeChild(element);
};

const insertElement = () => {
  const element = document.getElementById("simple-translate");
  if (element) return;

  document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate'></div>");
  ReactDOM.render(
    <TranslateContainer removeElement={removeElement} insertElement={insertElement} />,
    document.getElementById("simple-translate")
  );
};

insertElement();
