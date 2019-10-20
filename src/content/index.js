import React from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import { initSettings, getSettings, handleSettingsChange } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import TranslateContainer from "./components/TranslateContainer";

const init = async () => {
  await initSettings();
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("keydown", handleKeyDown);
  browser.storage.onChanged.addListener(handleSettingsChange);
  browser.runtime.onMessage.addListener(handleMessage);
  overWriteLogLevel();
  updateLogLevel();
  disableExtensionByUrlList();
};
init();

const handleMouseUp = async e => {
  await waitTime(10);
  const isLeftClick = e.button === 0;
  const isInPasswordField = e.target.tagName === "INPUT" && e.target.type === "password";
  const isInThisElement =
    document.querySelector("#simple-translate") &&
    document.querySelector("#simple-translate").contains(e.target);
  if (!isLeftClick) return;
  if (isInPasswordField) return;
  if (isInThisElement) return;
  removeTranslatecontainer();

  const selectedText = getSelectedText();
  if (selectedText.length === 0) return;

  const clickedPosition = { x: e.clientX, y: e.clientY };
  const selectedPosition = getSelectedPosition();
  showTranslateContainer(selectedText, selectedPosition, clickedPosition);
};

const waitTime = time => {
  return new Promise(resolve => setTimeout(() => resolve(), time));
};

const getSelectedText = () => {
  const element = document.activeElement;
  const isInTextField = element.tagName === "INPUT" || element.tagName === "TEXTAREA";
  const selectedText = isInTextField
    ? element.value.substring(element.selectionStart, element.selectionEnd)
    : window.getSelection().toString();
  return selectedText;
};

const getSelectedPosition = () => {
  const element = document.activeElement;
  const isInTextField = element.tagName === "INPUT" || element.tagName === "TEXTAREA";
  const selectedRect = isInTextField
    ? element.getBoundingClientRect()
    : window
        .getSelection()
        .getRangeAt(0)
        .getBoundingClientRect();

  let selectedPosition;
  const panelReferencePoint = getSettings("panelReferencePoint");
  switch (panelReferencePoint) {
    case "topSelectedText":
      selectedPosition = {
        x: selectedRect.left + selectedRect.width / 2,
        y: selectedRect.top
      };
      break;
    case "bottomSelectedText":
    default:
      selectedPosition = {
        x: selectedRect.left + selectedRect.width / 2,
        y: selectedRect.bottom
      };
      break;
  }
  return selectedPosition;
};

const handleKeyDown = e => {
  if (e.key === "Escape") {
    removeTranslatecontainer();
  }
};

let isEnabled = true;
const handleMessage = async request => {
  const empty = new Promise(resolve => {
    setTimeout(() => {
      return resolve("");
    }, 100);
  });

  switch (request.message) {
    case "getTabUrl":
      if (!isEnabled) return empty;
      if (window == window.parent) return location.href;
      else return empty;
    case "getSelectedText": {
      if (!isEnabled) return empty;
      const selectedText = getSelectedText();
      if (selectedText.length === 0) return empty;
      else return selectedText;
    }
    case "translateSelectedText": {
      if (!isEnabled) return empty;
      const selectedText = getSelectedText();
      if (selectedText.length === 0) return;
      const selectedPosition = getSelectedPosition();
      removeTranslatecontainer();
      showTranslateContainer(selectedText, selectedPosition, null, true);
      break;
    }
    case "getEnabled":
      return isEnabled;
    case "enableExtension":
      isEnabled = true;
      break;
    case "disableExtension":
      removeTranslatecontainer();
      isEnabled = false;
      break;
    default:
      return empty;
  }
};

const disableExtensionByUrlList = () => {
  const disableUrls = getSettings("disableUrlList").split("\n");
  let pageUrl;
  try {
    pageUrl = top.location.href;
  } catch (e) {
    pageUrl = document.referrer;
  }

  const matchesPageUrl = urlPattern => {
    const pattern = urlPattern
      .trim()
      .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, match => (match === "*" ? ".*" : "\\" + match));
    if (pattern === "") return false;
    return RegExp("^" + pattern + "$").test(pageUrl);
  };

  const isMatched = disableUrls.some(matchesPageUrl);
  if (isMatched) isEnabled = false;
};

const removeTranslatecontainer = async () => {
  const element = document.getElementById("simple-translate");
  if (!element) return;

  ReactDOM.unmountComponentAtNode(element);
  element.parentNode.removeChild(element);
};

const showTranslateContainer = (
  selectedText,
  selectedPosition,
  clickedPosition = null,
  shouldTranslate = false
) => {
  const element = document.getElementById("simple-translate");
  if (element) return;
  if (!isEnabled) return;

  document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate'></div>");
  ReactDOM.render(
    <TranslateContainer
      removeContainer={removeTranslatecontainer}
      selectedText={selectedText}
      selectedPosition={selectedPosition}
      clickedPosition={clickedPosition}
      shouldTranslate={shouldTranslate}
    />,
    document.getElementById("simple-translate")
  );
};
