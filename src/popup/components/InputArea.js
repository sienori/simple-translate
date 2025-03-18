import React, { Component } from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import ListenButton from "./ListenButton";
import "../styles/InputArea.scss";
import splitLine from "../../common/splitLine";

export default class InputArea extends Component {
  resizeTextArea = () => {
    const textarea = ReactDOM.findDOMNode(this.refs.textarea);
    textarea.style.height = "1px";
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  };

  handleInputText = e => {
    const inputText = e.target.value;
    this.props.handleInputText(inputText);
  };

  shouldComponentUpdate(nextProps) {
    const shouldUpdate =
      this.props.inputText !== nextProps.inputText ||
      this.props.src_transliteration !== nextProps.src_transliteration ||
      this.props.sourceLang !== nextProps.sourceLang;
    return shouldUpdate;
  }

  componentDidUpdate = () => {
    this.resizeTextArea();
  };

  render() {
    const { inputText, src_transliteration, sourceLang } = this.props;
    return (
      <div id="inputArea">
        <textarea
          value={inputText}
          ref="textarea"
          placeholder={browser.i18n.getMessage("initialTextArea")}
          onChange={this.handleInputText}
          autoFocus
          spellCheck={false}
          dir="auto"
        />
      <p className="src_transliteration" dir="auto">{splitLine(src_transliteration)}</p>
      <div className="listen">
          {sourceLang && <ListenButton text={inputText} lang={sourceLang} />}
        </div>
      </div>
    );
  }
}
