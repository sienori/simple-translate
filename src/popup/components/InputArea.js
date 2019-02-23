import React, { Component } from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import "../styles/inputArea.scss";

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
    const shouldUpdate = this.props.inputText !== nextProps.inputText;
    return shouldUpdate;
  }

  componentDidUpdate = () => {
    this.resizeTextArea();
  };

  render() {
    return (
      <div id="inputArea">
        <textarea
          value={this.props.inputText}
          ref="textarea"
          placeholder={browser.i18n.getMessage("initialTextArea")}
          onChange={this.handleInputText}
          autoFocus
          spellCheck={false}
        />
      </div>
    );
  }
}
