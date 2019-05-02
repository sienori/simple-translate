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
      insertElement();
      break;
    case "disableExtension":
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
  isEnabled = false;
};

let isFirst = true;
const insertElement = () => {
  const element = document.getElementById("simple-translate");
  if (element) return;

  document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate'></div>");
  ReactDOM.render(
    <TranslateContainer
      removeElement={removeElement}
      insertElement={insertElement}
      isFirst={isFirst}
    />,
    document.getElementById("simple-translate")
  );
  isFirst = false;
  isEnabled = true;
};

insertElement();
