import React, { Component } from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import "../styles/Footer.scss";
import { getSettings } from "../../settings/settings";

export default class Footer extends Component {
  constructor(props) {
    super(props);
  }

  handleTranslatePageClick = async () => {
    const { tabUrl, targetLang } = this.props;
    const encodedUrl = encodeURIComponent(tabUrl);
    const translateUrl = `https://translate.google.com/translate?hl=${targetLang}&tl=${targetLang}&sl=auto&u=${encodedUrl}`;
    const isCurrentTab = getSettings("pageTranslationOpenTo") === "currentTab";
    openUrl(translateUrl, isCurrentTab);
  };

  handleMoreClick = async () => {
    const { inputText, targetLang } = this.props;
    const translationApi = getSettings("translationApi");
    const encodedText = encodeURIComponent(inputText);
    const translateUrl = translationApi === "google" ?
      `https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodedText}` :
      `https://www.deepl.com/translator#auto/${targetLang}/${encodedText}`
      ;
    openUrl(translateUrl);
  }

  handleChange = e => {
    const lang = e.target.value;
    this.props.handleLangChange(lang);
  };

  render() {
    const { tabUrl, inputText, targetLang, langHistory, langList } = this.props;

    return (
      <div id="footer">
        <div className="translateLink">
          {tabUrl && <a onClick={this.handleTranslatePageClick}>{browser.i18n.getMessage("showLink")}</a>}
        </div>
        <div className="translateLink">
          {inputText && <a onClick={this.handleMoreClick}>MORE »</a>}
        </div>
        <div className="selectWrap">
          <select
            id="langList"
            value={targetLang}
            onChange={this.handleChange}
            title={browser.i18n.getMessage("targetLangLabel")}
          >

            <optgroup label={browser.i18n.getMessage("recentLangLabel")}>
              {langList.filter(option => langHistory.includes(option.value))
                .map(option => (
                  <option value={option.value} key={option.value}>
                    {option.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label={browser.i18n.getMessage("allLangLabel")}>
              {langList.map(option => (
                <option value={option.value} key={option.value}>
                  {option.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    );
  }
}
