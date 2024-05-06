import React from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings";
import "../styles/TranslateButton.scss";

const calcPosition = () => {
  const buttonSize = parseInt(getSettings("buttonSize"));
  const offset = parseInt(getSettings("buttonOffset"));
  switch (getSettings("buttonDirection")) {
    case "top":
      return { top: -buttonSize - offset, left: -buttonSize / 2 };
    case "bottom":
      return { top: offset, left: -buttonSize / 2 };
    case "right":
      return { top: -buttonSize / 2, left: offset };
    case "left":
      return { top: -buttonSize / 2, left: -buttonSize - offset };
    case "topRight":
      return { top: -buttonSize - offset, left: offset };
    case "topLeft":
      return { top: -buttonSize - offset, left: -buttonSize - offset };
    case "bottomLeft":
      return { top: offset, left: -buttonSize - offset };
    case "bottomRight":
    default:
      return { top: offset, left: offset };
  }
};

export default props => {
  const { position, shouldShow } = props;
  const buttonSize = parseInt(getSettings("buttonSize"));
  const { top, left } = calcPosition();
  const iconUrl = browser.runtime.getURL("icons/512.png");
  const buttonStyle = {
    backgroundImage: `url(${iconUrl})`,
    height: buttonSize,
    width: buttonSize,
    top: top + position.y,
    left: left + position.x
  };
  return (
    <div
      style={buttonStyle}
      className={`simple-translate-button ${shouldShow ? "isShow" : ""}`}
      onClick={props.handleButtonClick}
    />
  );
};
