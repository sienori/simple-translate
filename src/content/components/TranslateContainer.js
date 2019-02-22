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
  const selectedPosition = {
    x: selectedRect.left + selectedRect.width / 2,
    y: selectedRect.bottom
  };
  return selectedPosition;
};

const translateText = async text => {
  const targetLang = getSettings("targetLang");
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
  const matchsLangs = targetLang === result.sourceLanguage && result.percentage > 0;
  return matchsLangs;
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
      candidateText: ""
    };
    this.selectedText = "";
    this.init();
  }

  init = async () => {
    await initSettings();
    this.setState({ isInit: true });
    document.addEventListener("mouseup", e => setTimeout(() => this.handleMouseUp(e), 0));
    document.addEventListener("keydown", this.handleKeyDown);
    browser.storage.onChanged.addListener(handleSettingsChange);
    browser.runtime.onMessage.addListener(this.handleMessage);
    overWriteLogLevel();
    updateLogLevel();
  };

  handleMessage = async request => {
    switch (request.message) {
      case "getTabInfo":
        const tabInfo = { url: location.href, selectedText: this.selectedText };
        return tabInfo;
      case "translateSelectedText":
        this.selectedText = getSelectedText();
        const position = getSelectedPosition();
        if (this.selectedText.length === 0) return;
        this.hideButton();
        this.showPanel(position);
        break;
    }
  };

  handleKeyDown = e => {
    if (e.key === "Escape") {
      this.hideButton();
      this.hidePanel();
    }
  };

  showButton = position => {
    this.setState({ shouldShowButton: true, buttonPosition: position });
  };

  hideButton = () => {
    this.setState({ shouldShowButton: false });
  };

  handleButtonClick = e => {
    const position = { x: e.clientX, y: e.clientY };
    this.showPanel(position);
    this.hideButton();
  };

  showPanel = async position => {
    const result = await translateText(this.selectedText);
    this.setState({
      shouldShowPanel: true,
      panelPosition: position,
      resultText: result.resultText,
      candidateText: getSettings("ifShowCandidate") ? result.candidateText : ""
    });
  };

  hidePanel = () => {
    this.setState({ shouldShowPanel: false });
  };

  handleMouseUp = e => {
    const isLeftClick = e.button === 0;
    const isInPasswordField = e.target.tagName === "INPUT" && e.target.type === "password";
    const isInThisElement = document.querySelector("#simple-translate").contains(e.target);
    if (!isLeftClick) return;
    if (isInPasswordField) return;
    if (isInThisElement) return;
    this.hideButton();
    this.hidePanel();

    this.selectedText = getSelectedText();
    const position = { x: e.clientX, y: e.clientY };

    if (this.selectedText.length === 0) return;
    this.handleTextSelect(position);
  };

  handleTextSelect = async position => {
    const onSelectBehavior = getSettings("whenSelectText");
    if (onSelectBehavior === "dontShowButton") return;

    if (getSettings("ifCheckLang")) {
      const matchesLang = await matchesTargetLang(this.selectedText);
      if (matchesLang) return;
    }

    if (onSelectBehavior === "showButton") {
      this.showButton(position);
    } else if (onSelectBehavior === "showPanel") {
      this.showPanel(position);
    }
  };

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
          hidePanel={this.hidePanel}
        />
      </div>
    );
  };
}
