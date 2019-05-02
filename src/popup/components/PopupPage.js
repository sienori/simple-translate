import React, { Component } from "react";
import browser from "webextension-polyfill";
import { initSettings, getSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import translate from "src/common/translate";
import Header from "./Header";
import InputArea from "./InputArea";
import ResultArea from "./ResultArea";
import Footer from "./Footer";
import "../styles/PopupPage.scss";

const getTabInfo = async () => {
  try {
    const tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
    const tabUrl = browser.tabs.sendMessage(tab.id, { message: "getTabUrl" });
    const selectedText = browser.tabs.sendMessage(tab.id, { message: "getSelectedText" });
    const isEnabledOnPage = browser.tabs.sendMessage(tab.id, { message: "getEnabled" });
    return {
      isConnected: true,
      url: await tabUrl,
      selectedText: await selectedText,
      isEnabledOnPage: await isEnabledOnPage
    };
  } catch (e) {
    return { isConnected: false, url: "", selectedText: "", isEnabledOnPage: false };
  }
};

export default class PopupPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetLang: "",
      inputText: "",
      resultText: "",
      candidateText: "",
      statusText: "OK",
      tabUrl: "",
      isConnected: true,
      isEnabledOnPage: true
    };
    this.isSwitchedSecondLang = false;
    this.init();
  }

  init = async () => {
    await initSettings();
    overWriteLogLevel();
    updateLogLevel();

    const targetLang = getSettings("targetLang");
    this.setState({
      targetLang: targetLang
    });

    const tabInfo = await getTabInfo();
    this.setState({
      isConnected: tabInfo.isConnected,
      inputText: tabInfo.selectedText,
      tabUrl: tabInfo.url,
      isEnabledOnPage: tabInfo.isEnabledOnPage
    });
    if (tabInfo.selectedText !== "") this.translateText(tabInfo.selectedText, targetLang);
  };

  handleInputText = inputText => {
    this.setState({ inputText: inputText });

    const waitTime = getSettings("waitTime");
    clearTimeout(this.inputTimer);
    this.inputTimer = setTimeout(
      () => this.translateText(inputText, this.state.targetLang),
      waitTime
    );
  };

  handleLangChange = lang => {
    this.setState({ targetLang: lang });
    const inputText = this.state.inputText;
    if (inputText !== "") this.translateText(inputText, lang);
  };

  translateText = async (text, targetLang) => {
    const result = await translate(text, "auto", targetLang);
    this.setState({
      resultText: result.resultText,
      candidateText: result.candidateText,
      statusText: result.statusText
    });
    this.switchSecondLang(result);
  };

  switchSecondLang = result => {
    if (!getSettings("ifChangeSecondLang")) return;

    const defaultTargetLang = getSettings("targetLang");
    const secondLang = getSettings("secondTargetLang");
    if (defaultTargetLang === secondLang) return;

    const equalsSourceAndTarget =
      result.sourceLanguage === this.state.targetLang && result.percentage > 0;
    const equalsSourceAndDefault =
      result.sourceLanguage === defaultTargetLang && result.percentage > 0;

    if (!this.isSwitchedSecondLang) {
      if (equalsSourceAndTarget && equalsSourceAndDefault) {
        this.handleLangChange(secondLang);
        this.isSwitchedSecondLang = true;
      }
    } else {
      if (!equalsSourceAndDefault) {
        this.handleLangChange(defaultTargetLang);
        this.isSwitchedSecondLang = false;
      }
    }
  };

  toggleEnabledOnPage = async e => {
    const isEnabled = e.target.checked;
    this.setState({ isEnabledOnPage: isEnabled });
    try {
      const tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
      if (isEnabled) await browser.tabs.sendMessage(tab.id, { message: "enableExtension" });
      else await browser.tabs.sendMessage(tab.id, { message: "disableExtension" });
    } catch (e) {}
  };

  render() {
    return (
      <div>
        <Header
          toggleEnabledOnPage={this.toggleEnabledOnPage}
          isEnabledOnPage={this.state.isEnabledOnPage}
          isConnected={this.state.isConnected}
        />
        <InputArea inputText={this.state.inputText} handleInputText={this.handleInputText} />
        <hr />
        <ResultArea
          inputText={this.state.inputText}
          targetLang={this.state.targetLang}
          resultText={this.state.resultText}
          candidateText={this.state.candidateText}
          statusText={this.state.statusText}
        />
        <Footer
          tabUrl={this.state.tabUrl}
          targetLang={this.state.targetLang}
          handleLangChange={this.handleLangChange}
        />
      </div>
    );
  }
}
