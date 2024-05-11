import React, { Component } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import generateLangOptions from "src/common/generateLangOptions";
import Header from "./Header";
import InputArea from "./InputArea";
import ResultArea from "./ResultArea";
import Footer from "./Footer";
import "../styles/PopupPage.scss";
import { getBackgroundColor } from "../../settings/defaultColors";

const logDir = "popup/PopupPage";

const getTabInfo = async () => {
  try {
    const tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
    const tabUrl = browser.tabs.sendMessage(tab.id, { message: "getTabUrl" });
    const selectedText = browser.tabs.sendMessage(tab.id, { message: "getSelectedText" });
    const isEnabledOnPage = browser.tabs.sendMessage(tab.id, { message: "getEnabled" });

    const tabInfo = await Promise.all([tabUrl, selectedText, isEnabledOnPage]);
    return {
      isConnected: true,
      url: tabInfo[0],
      selectedText: tabInfo[1],
      isEnabledOnPage: tabInfo[2]
    };
  } catch (e) {
    return { isConnected: false, url: "", selectedText: "", isEnabledOnPage: false };
  }
};

const UILanguage =  browser.i18n.getUILanguage()
const rtlLanguage = ['he', 'ar'].includes(UILanguage)
const rtlLanguageClassName = rtlLanguage ? 'popup-page-rtl-language' : ''


export default class PopupPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetLang: "",
      inputText: "",
      resultText: "",
      candidateText: "",
      sourceLang: "",
      isError: false,
      errorMessage: "",
      langList: [],
      tabUrl: "",
      isConnected: true,
      isEnabledOnPage: true,
      langHistory: []
    };
    this.isSwitchedSecondLang = false;
    this.init();
  }

  init = async () => {
    await initSettings();
    overWriteLogLevel();
    updateLogLevel();

    this.themeClass = getSettings("theme") + "-theme";
    document.body.classList.add(this.themeClass)
    const targetLang = getSettings("targetLang");
    let langHistory = getSettings("langHistory");
    if (!langHistory) {
      const secondLang = getSettings("secondTargetLang");
      langHistory = [targetLang, secondLang];
      setSettings("langHistory", langHistory);
    }
    this.setState({
      targetLang: targetLang,
      langHistory: langHistory,
      langList: generateLangOptions(getSettings("translationApi"))
    });

    const tabInfo = await getTabInfo();
    this.setState({
      isConnected: tabInfo.isConnected,
      inputText: tabInfo.selectedText,
      tabUrl: tabInfo.url,
      isEnabledOnPage: tabInfo.isEnabledOnPage
    });
    if (tabInfo.selectedText !== "") this.handleInputText(tabInfo.selectedText);

    document.body.style.width = "348px";
  };

  handleInputText = inputText => {
    this.setState({ inputText: inputText });

    const waitTime = getSettings("waitTime");
    clearTimeout(this.inputTimer);
    this.inputTimer = setTimeout(async () => {
      const result = await this.translateText(inputText, this.state.targetLang);
      this.switchSecondLang(result);
    }, waitTime);
  };

  setLangHistory = lang => {
    let langHistory = getSettings("langHistory") || [];
    langHistory.push(lang);
    if (langHistory.length > 30) langHistory = langHistory.slice(-30);
    setSettings("langHistory", langHistory);
    this.setState({ langHistory: langHistory });
  };

  handleLangChange = lang => {
    log.info(logDir, "handleLangChange()", lang);
    this.setState({ targetLang: lang });
    const inputText = this.state.inputText;
    if (inputText !== "") this.translateText(inputText, lang);
    this.setLangHistory(lang);
  };

  translateText = async (text, targetLang) => {
    log.info(logDir, "translateText()", text, targetLang);
    const result = await browser.runtime.sendMessage({
      message: 'translate',
      text: text,
      sourceLang: 'auto',
      targetLang: targetLang,
    });
    this.setState({
      resultText: result.resultText,
      candidateText: result.candidateText,
      sourceLang: result.sourceLanguage,
      isError: result.isError,
      errorMessage: result.errorMessage
    });
    return result;
  };

  switchSecondLang = result => {
    if (!getSettings("ifChangeSecondLang")) return;

    const defaultTargetLang = getSettings("targetLang");
    const secondLang = getSettings("secondTargetLang");
    if (defaultTargetLang === secondLang) return;

    const equalsSourceAndTarget =
      result.sourceLanguage.split("-")[0] === this.state.targetLang.split("-")[0] && result.percentage > 0;
    const equalsSourceAndDefault =
      result.sourceLanguage.split("-")[0] === defaultTargetLang.split("-")[0] && result.percentage > 0;
    // split("-")[0] : deepLでenとen-USを区別しないために必要

    if (!this.isSwitchedSecondLang) {
      if (equalsSourceAndTarget && equalsSourceAndDefault) {
        log.info(logDir, "=>switchSecondLang()", result, secondLang);
        this.handleLangChange(secondLang);
        this.isSwitchedSecondLang = true;
      }
    } else {
      if (!equalsSourceAndDefault) {
        log.info(logDir, "=>switchSecondLang()", result, defaultTargetLang);
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
    } catch (e) { }
  };

  render() {
    return (
      <div className={rtlLanguageClassName}>
        <Header
          toggleEnabledOnPage={this.toggleEnabledOnPage}
          isEnabledOnPage={this.state.isEnabledOnPage}
          isConnected={this.state.isConnected}
        />
        <InputArea
          inputText={this.state.inputText}
          handleInputText={this.handleInputText}
          sourceLang={this.state.sourceLang}
        />
        <hr />
        <ResultArea
          inputText={this.state.inputText}
          targetLang={this.state.targetLang}
          resultText={this.state.resultText}
          candidateText={this.state.candidateText}
          isError={this.state.isError}
          errorMessage={this.state.errorMessage}
        />
        <Footer
          tabUrl={this.state.tabUrl}
          targetLang={this.state.targetLang}
          langHistory={this.state.langHistory}
          handleLangChange={this.handleLangChange}
          langList={this.state.langList}
        />
      </div>
    );
  }
}
