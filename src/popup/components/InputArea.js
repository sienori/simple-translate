import React, { Component, createRef } from "react";
import browser from "webextension-polyfill";
import ListenButton from "./ListenButton";
import "../styles/InputArea.scss";

export default class InputArea extends Component {
  inputRef = createRef(null);

  resizeTextArea = () => {
    const textarea = this.inputRef.current;
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
      this.props.sourceLang !== nextProps.sourceLang;
    return shouldUpdate;
  }

  componentDidMount = () => {
    const textarea = ReactDOM.findDOMNode(this.refs.textarea);
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
      }, 100);
    }
  };

  componentDidUpdate = () => {
    this.resizeTextArea();
  };

  componentDidMount = () => {
    const textarea = this.inputRef.current;
    setTimeout(() => {
      textarea.focus();
    }, 10);
  }

  render() {
    const { inputText, sourceLang } = this.props;
    return (
      <div id="inputArea">
        <textarea
          value={inputText}
          ref={this.inputRef}
          placeholder={browser.i18n.getMessage("initialTextArea")}
          onChange={this.handleInputText}
          spellCheck={false}
          dir="auto"
        />
        <div className="listen">
          {sourceLang && <ListenButton text={inputText} lang={sourceLang} />}
        </div>
      </div>
    );
  }
}
