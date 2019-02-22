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
    const tabInfo = await browser.tabs.sendMessage(tab.id, { message: "getTabInfo" });
    return tabInfo;
  } catch (e) {
    return { url: "", selectedText: "" };
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
      tabUrl: ""
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
      inputText: tabInfo.selectedText,
      tabUrl: tabInfo.url
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

  render() {
    return (
      <div>
        <Header />
        <InputArea inputText={this.state.inputText} handleInputText={this.handleInputText} />
        <hr />
        <ResultArea
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
