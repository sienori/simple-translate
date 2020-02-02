import React, { Component } from "react";
import browser from "webextension-polyfill";
import translate from "src/common/translate";
import { getSettings } from "src/settings/settings";
import TranslateButton from "./TranslateButton";
import TranslatePanel from "./TranslatePanel";
import "../styles/TranslateContainer.scss";

const translateText = async (text, targetLang = getSettings("targetLang")) => {
  const result = await translate(text, "en", targetLang);
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

export default class TranslateContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowButton: false,
      buttonPosition: { x: 0, y: 0 },
      shouldShowPanel: false,
      panelPosition: { x: 0, y: 0 },
      resultText: "",
      candidateText: "",
      statusText: "OK"
    };
    this.selectedText = props.selectedText;
    this.selectedPosition = props.selectedPosition;
  }

  componentDidMount = () => {
    if (this.props.shouldTranslate) this.showPanel();
    else this.handleTextSelect(this.props.clickedPosition);
  };

  handleTextSelect = async clickedPosition => {
    const onSelectBehavior = getSettings("whenSelectText");
    if (onSelectBehavior === "dontShowButton") return this.props.removeContainer();

    if (getSettings("ifCheckLang")) {
      const matchesLang = await matchesTargetLang(this.selectedText);
      if (matchesLang) return this.props.removeContainer();
    }

    if (onSelectBehavior === "showButton") this.showButton(clickedPosition);
    else if (onSelectBehavior === "showPanel") this.showPanel(clickedPosition);
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

  render = () => {
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
