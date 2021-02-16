import React, { Component } from "react";
import ReactDOM from "react-dom";
import { getSettings } from "src/settings/settings";
import getErrorMessage from "src/common/getErrorMessage";
import "../styles/TranslatePanel.scss";

const splitLine = text => {
  const regex = /(\n)/g;
  return text.split(regex).map((line, i) => (line.match(regex) ? <br key={i} /> : line));
};

export default class TranslatePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelPosition: { x: 0, y: 0 },
      panelWidth: 0,
      panelHeight: 0,
      shouldResize: true,
      isOverflow: false
    };

    this.dragOffsets = { x: 0, y: 0 };
    this.isDragging = false;
  }

  componentDidMount = () => {
    document.addEventListener("dragstart", this.handleDragStart);
    document.addEventListener("dragover", this.handleDragOver);
    document.addEventListener("drop", this.handleDrop);
  };

  componentWillUnmount = () => {
    document.removeEventListener("dragstart", this.handleDragStart);
    document.removeEventListener("dragover", this.handleDragOver);
    document.removeEventListener("drop", this.handleDrop);
  };

  handleDragStart = e => {
    if (e.target.className !== "simple-translate-move") return;
    this.isDragging = true;

    const rect = document.querySelector(".simple-translate-panel").getBoundingClientRect();
    this.dragOffsets = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    e.dataTransfer.setData("text/plain", "");
  };

  handleDragOver = e => {
    if (!this.isDragging) return;
    e.preventDefault();
    const panel = document.querySelector(".simple-translate-panel");
    panel.style.top = `${e.clientY - this.dragOffsets.y}px`;
    panel.style.left = `${e.clientX - this.dragOffsets.x}px`;
  };

  handleDrop = e => {
    if (!this.isDragging) return;
    e.preventDefault();
    this.isDragging = false;

    const panel = document.querySelector(".simple-translate-panel");
    panel.style.top = `${e.clientY - this.dragOffsets.y}px`;
    panel.style.left = `${e.clientX - this.dragOffsets.x}px`;
  };

  calcPosition = () => {
    const maxWidth = parseInt(getSettings("width"));
    const maxHeight = parseInt(getSettings("height"));
    const wrapper = ReactDOM.findDOMNode(this.refs.wrapper);
    const panelWidth = Math.min(wrapper.clientWidth, maxWidth);
    const panelHeight = Math.min(wrapper.clientHeight, maxHeight);
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;
    const referencePosition = this.props.position;
    const offset = parseInt(getSettings("panelOffset"));

    let position = { x: 0, y: 0 };
    const panelDirection = getSettings("panelDirection");
    switch (panelDirection) {
      case "top":
        position.x = referencePosition.x - panelWidth / 2;
        position.y = referencePosition.y - panelHeight - offset;
        break;
      case "bottom":
        position.x = referencePosition.x - panelWidth / 2;
        position.y = referencePosition.y + offset;
        break;
      case "right":
        position.x = referencePosition.x + offset;
        position.y = referencePosition.y - panelHeight / 2;
        break;
      case "left":
        position.x = referencePosition.x - panelWidth - offset;
        position.y = referencePosition.y - panelHeight / 2;
        break;
      case "topRight":
        position.x = referencePosition.x + offset;
        position.y = referencePosition.y - panelHeight - offset;
        break;
      case "topLeft":
        position.x = referencePosition.x - panelWidth - offset;
        position.y = referencePosition.y - panelHeight - offset;
        break;
      case "bottomRight":
        position.x = referencePosition.x + offset;
        position.y = referencePosition.y + offset;
        break;
      case "bottomLeft":
        position.x = referencePosition.x - panelWidth - offset;
        position.y = referencePosition.y + offset;
        break;
    }

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
    const maxWidth = parseInt(getSettings("width"));
    const wrapper = ReactDOM.findDOMNode(this.refs.wrapper);
    const wrapperWidth = wrapper.clientWidth < maxWidth ? wrapper.clientWidth + 1 : maxWidth;
    const wrapperHeight = wrapper.clientHeight;
    return { panelWidth: wrapperWidth, panelHeight: wrapperHeight };
  };

  componentWillReceiveProps = nextProps => {
    const isChangedContents =
      this.props.resultText !== nextProps.resultText ||
      this.props.candidateText !== nextProps.candidateText ||
      this.props.position !== nextProps.position;

    if (isChangedContents && nextProps.shouldShow) this.setState({ shouldResize: true });
  };

  componentDidUpdate = () => {
    if (!this.state.shouldResize || !this.props.shouldShow) return;
    const panelPosition = this.calcPosition();
    const { panelWidth, panelHeight } = this.calcSize();
    const isOverflow = panelHeight == parseInt(getSettings("height"));

    this.setState({
      shouldResize: false,
      panelPosition: panelPosition,
      panelWidth: panelWidth,
      panelHeight: panelHeight,
      isOverflow: isOverflow
    });
  };

  render = () => {
    const { shouldShow, resultText, candidateText, statusText } = this.props;
    const isError = statusText !== "OK";
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
      overflow: this.state.isOverflow ? "auto" : "hidden"
    };
    const resultStyles = {
      color: getSettings("resultFontColor")
    };
    const candidateStyles = {
      color: getSettings("candidateFontColor")
    };

    return (
      <div
        className={`simple-translate-panel ${shouldShow ? "isShow" : ""}`}
        ref="panel"
        style={panelStyles}
      >
        <div className="simple-translate-result-wrapper" ref="wrapper" style={wrapperStyles}>
          <div className="simple-translate-move" draggable="true" ref="move"></div>
          <div className="simple-translate-result-contents">
            <p className="simple-translate-result" style={resultStyles} dir="auto">
              {splitLine(resultText)}
            </p>
            <p className="simple-translate-candidate" style={candidateStyles} dir="auto">
              {splitLine(candidateText)}
            </p>
            {isError && (
              <p className="simple-translate-error" style={candidateStyles}>
                {getErrorMessage(statusText)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
}
