import React, { Component } from "react";
import browser from "webextension-polyfill";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CopyIcon from "../icons/copy.svg";
import "../styles/MediaButtons.scss";

export default class CopyButton extends Component {
  constructor(props) {
    super(props);
    this.state = { isCopied: false };
  }

  handleCopy = () => {
    this.setState({ isCopied: true });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.resultText !== nextProps.resultText) this.setState({ isCopied: false });
  }

  render() {
    const { resultText } = this.props;
    return (
      resultText && (
        <div className="mediaButtons">
          <div className="copy">
            {this.state.isCopied && (
              <span className="copiedText">{browser.i18n.getMessage("copiedLabel")}</span>
            )}
            <CopyToClipboard text={resultText} onCopy={this.handleCopy}>
              <button className="copyButton" title={browser.i18n.getMessage("copyLabel")}>
                <CopyIcon />
              </button>
            </CopyToClipboard>
          </div>
        </div>
      )
    );
  }
}
