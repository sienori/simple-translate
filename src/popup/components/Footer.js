import React, { Component } from "react";
import browser from "webextension-polyfill";
import genelateLangOptions from "src/common/genelateLangOptions";
import openUrl from "src/common/openUrl";
import "../styles/Footer.scss";

export default class Footer extends Component {
  constructor(props) {
    super(props);
    this.langList = genelateLangOptions();
  }

  handleLinkClick = async () => {
    const { tabUrl, targetLang } = this.props;
    const encodedUrl = encodeURIComponent(tabUrl);
    const translateUrl = `https://translate.google.com/translate?hl=${targetLang}&sl=auto&u=${encodedUrl}`;
    openUrl(translateUrl);
  };

  handleChange = e => {
    const lang = e.target.value;
    this.props.handleLangChange(lang);
  };

  render() {
    const { tabUrl, targetLang } = this.props;

    return (
      <div id="footer">
        <div className="translateLink">
          {tabUrl && <a onClick={this.handleLinkClick}>{browser.i18n.getMessage("showLink")}</a>}
        </div>
        <div className="selectWrap">
          <select
            id="langList"
            value={targetLang}
            onChange={this.handleChange}
            title={browser.i18n.getMessage("targetLangLabel")}
          >
            {this.langList.map(option => (
              <option value={option.value} key={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}
