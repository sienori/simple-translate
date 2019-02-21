import React, { Component } from "react";
import ReactDOM from "react-dom";
import { getSettings } from "src/settings/settings";
import "../styles/TranslatePanel.scss";

export default class TranslatePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelPosition: { x: 0, y: 0 },
      panelWidth: 0,
      panelHeight: 0,
      shouldResize: true
    };
    this.isFirst = true;
  }

  calcPosition = () => {
    const maxWidth = parseInt(getSettings("width"));
    const maxHeight = parseInt(getSettings("height"));
    const wrapper = ReactDOM.findDOMNode(this.refs.wrapper);
    const panelWidth = Math.min(wrapper.clientWidth, maxWidth);
    const panelHeight = Math.min(wrapper.clientHeight, maxHeight);
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;
    const offset = 10;

    //TODO: パネルの表示位置オプション
    let position = {
      x: this.props.position.x - panelWidth / 2,
      y: this.props.position.y + offset
    };

    if (position.x + panelWidth > windowWidth - offset) {
      position.x = windowWidth - panelWidth - offset;
    }
    if (position.y + panelHeight > windowHeight - offset) {
      position.y = windowHeight - panelHeight - offset;
    }
    if (position.x < 0 + offset) {
      position.x = offset;
    }
    if (position.y < 0 + offset) {
      position.y = offset;
    }
    return position;
  };

  calcSize = () => {
    const wrapper = ReactDOM.findDOMNode(this.refs.wrapper);
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;
    return { panelWidth: wrapperWidth, panelHeight: wrapperHeight };
  };

  componentWillReceiveProps = nextProps => {
    const isChangedContents =
      this.props.resultText !== nextProps.resultText ||
      this.props.candidateText !== nextProps.candidateText;

    if (isChangedContents && nextProps.shouldShow) this.setState({ shouldResize: true });
  };

  componentDidUpdate = () => {
    if (!this.state.shouldResize || !this.props.shouldShow) return;
    const panelPosition = this.calcPosition();
    const { panelWidth, panelHeight } = this.calcSize();
    this.setState({
      shouldResize: false,
      panelPosition: panelPosition,
      panelWidth: panelWidth,
      panelHeight: panelHeight
    });
  };

  render = () => {
    const { width, height } = this.state.shouldResize
      ? { width: parseInt(getSettings("width")), height: parseInt(getSettings("height")) }
      : { width: this.state.panelWidth, height: this.state.panelHeight };

    const panelStyles = {
      width: width,
      height: height,
      top: this.state.panelPosition.y,
      left: this.state.panelPosition.x,
      fontSize: parseInt(getSettings("fontSize")),
      backgroundColor: getSettings("bgColor")
    };
    const wrapperStyles = {
      overflow: this.state.shouldResize ? "hidden" : "auto"
    };
    const resultStyles = {
      color: getSettings("resultFontColor")
    };
    const candidateStyles = {
      color: getSettings("candidateFontColor")
    };

    return (
      <div
        className={`simple-translate-panel ${this.props.shouldShow ? "isShow" : ""}`}
        ref="panel"
        style={panelStyles}
      >
        <div className="simple-translate-result-wrapper" ref="wrapper" style={wrapperStyles}>
          <p className="simple-translate-result" style={resultStyles}>
            {this.props.resultText}
          </p>
          <p className="simple-translate-candidate" style={candidateStyles}>
            {this.props.candidateText}
          </p>
        </div>
      </div>
    );
  };
}
