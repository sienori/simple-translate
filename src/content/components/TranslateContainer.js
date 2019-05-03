import React, { Component } from "react";
import browser from "webextension-polyfill";
import translate from "src/common/translate";
import { initSettings, getSettings, handleSettingsChange } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import TranslateButton from "./TranslateButton";
import TranslatePanel from "./TranslatePanel";
import "../styles/TranslateContainer.scss";

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

const translateText = async (text, targetLang = getSettings("targetLang")) => {
  const result = await translate(text, "auto", targetLang);
  return result;
};

const matchesTargetLang = async selectedText => {
  const targetLang = getSettings("targetLang");
  //detectLanguageで判定
  const langInfo = await browser.i18n.detectLanguage(selectedText);
  const matchsLangsByDetect = langInfo.isReliable && langInfo.languages[0].language === targetLang;
  if (matchsLangsByDetect) return true;

  //先頭100字を翻訳にかけて判定
  const partSelectedText = selectedText.substring(0, 100);
  const result = await translateText(partSelectedText);
  const isError = result.statusText !== "OK";
  if (isError) return false;

  const isNotText = result.percentage === 0;
  if (isNotText) return true;

  const matchsLangs = targetLang === result.sourceLanguage;
  return matchsLangs;
};

const waitTime = time => {
  return new Promise(resolve => setTimeout(() => resolve(), time));
};

export default class TranslateContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInit: false,
      shouldShowButton: false,
      buttonPosition: { x: 0, y: 0 },
      shouldShowPanel: false,
      panelPosition: { x: 0, y: 0 },
      resultText: "",
      candidateText: "",
      statusText: "OK"
    };
    this.selectedText = "";
    this.selectedPosition = { x: 0, y: 0 };
    this.init();
  }

  init = async () => {
    await initSettings();
    this.setState({ isInit: true });
    document.addEventListener("mouseup", this.handleMouseUp);
    document.addEventListener("keydown", this.handleKeyDown);
    browser.storage.onChanged.addListener(handleSettingsChange);
    browser.runtime.onMessage.addListener(this.handleMessage);
    overWriteLogLevel();
    updateLogLevel();
    if (this.props.isFirst) this.disableExtensionByUrlList();
  };

  disableExtensionByUrlList = () => {
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
    if (isMatched) this.props.removeElement();
  };

  handleMessage = async request => {
    const empty = new Promise(resolve => {
      setTimeout(() => {
        return resolve("");
      }, 100);
    });

    switch (request.message) {
      case "getTabUrl":
        if (window == window.parent) return location.href;
        else return empty;
      case "getSelectedText":
        if (this.selectedText.length === 0) return empty;
        else return this.selectedText;
      case "translateSelectedText":
        this.selectedText = getSelectedText();
        if (this.selectedText.length === 0) return;
        this.selectedPosition = getSelectedPosition();
        this.hideButton();
        this.showPanel();
        break;
      default:
        return empty;
    }
  };

  handleKeyDown = e => {
    if (e.key === "Escape") {
      this.hideButton();
      this.hidePanel();
    }
  };

  showButton = clickedPosition => {
    this.setState({ shouldShowButton: true, buttonPosition: clickedPosition });
  };

  hideButton = () => {
    this.setState({ shouldShowButton: false });
  };

  handleButtonClick = e => {
    const clickedPosition = { x: e.clientX, y: e.clientY };
    this.showPanel(clickedPosition);
    this.hideButton();
  };

  showPanel = async (clickedPosition = null) => {
    const panelReferencePoint = getSettings("panelReferencePoint");
    const useClickedPosition = panelReferencePoint === "clickedPoint" && clickedPosition !== null;
    const panelPosition = useClickedPosition ? clickedPosition : this.selectedPosition;

    let result = await translateText(this.selectedText);
    if (getSettings("ifChangeSecondLangOnPage")) {
      const targetLang = getSettings("targetLang");
      const secondLang = getSettings("secondTargetLang");
      const shouldSwitchSecondLang =
        result.sourceLanguage === targetLang && result.percentage > 0 && targetLang !== secondLang;
      if (shouldSwitchSecondLang) result = await translateText(this.selectedText, secondLang);
    }

    this.setState({
      shouldShowPanel: true,
      panelPosition: panelPosition,
      resultText: result.resultText,
      candidateText: getSettings("ifShowCandidate") ? result.candidateText : "",
      statusText: result.statusText
    });
  };

  hidePanel = () => {
    this.setState({ shouldShowPanel: false });
  };

  handleMouseUp = async e => {
    await waitTime(0);
    const isLeftClick = e.button === 0;
    const isInPasswordField = e.target.tagName === "INPUT" && e.target.type === "password";
    const isInThisElement = document.querySelector("#simple-translate").contains(e.target);
    if (!isLeftClick) return;
    if (isInPasswordField) return;
    if (isInThisElement) return;
    this.hideButton();
    this.hidePanel();

    this.selectedText = getSelectedText();
    this.selectedPosition = getSelectedPosition();
    const clickedPosition = { x: e.clientX, y: e.clientY };

    if (this.selectedText.length === 0) return;
    this.handleTextSelect(clickedPosition);
  };

  handleTextSelect = async clickedPosition => {
    const onSelectBehavior = getSettings("whenSelectText");
    if (onSelectBehavior === "dontShowButton") return;

    if (getSettings("ifCheckLang")) {
      const matchesLang = await matchesTargetLang(this.selectedText);
      if (matchesLang) return;
    }

    if (onSelectBehavior === "showButton") {
      this.showButton(clickedPosition);
    } else if (onSelectBehavior === "showPanel") {
      this.showPanel(clickedPosition);
    }
  };

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("keydown", this.handleKeyDown);
    browser.storage.onChanged.removeListener(handleSettingsChange);
    browser.runtime.onMessage.removeListener(this.handleMessage);
  }

  render = () => {
    if (!this.state.isInit) return null;
    return (
      <div>
        <TranslateButton
          shouldShow={this.state.shouldShowButton}
          position={this.state.buttonPosition}
          handleButtonClick={this.handleButtonClick}
        />
        <TranslatePanel
          shouldShow={this.state.shouldShowPanel}
          position={this.state.panelPosition}
          resultText={this.state.resultText}
          candidateText={this.state.candidateText}
          statusText={this.state.statusText}
          hidePanel={this.hidePanel}
        />
      </div>
    );
  };
}
