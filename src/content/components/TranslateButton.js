import React from "react";
import { getSettings } from "src/settings/settings";
import "../styles/TranslateButton.scss";

const calcPosition = () => {
  const buttonSize = parseInt(getSettings("buttonSize"));
  const offset = 10;
  switch (getSettings("buttonPosition")) {
    case "rightUp":
      return { top: -buttonSize - offset, left: offset };
    case "rightDown":
      return { top: offset, left: offset };
    case "leftUp":
      return { top: -buttonSize - offset, left: -buttonSize - offset };
    case "leftDown":
      return { top: offset, left: -buttonSize - offset };
  }
};

export default props => {
  const { position, shouldShow } = props;
  const buttonSize = parseInt(getSettings("buttonSize"));
  const { top, left } = calcPosition();
  const buttonStyle = {
    height: buttonSize,
    width: buttonSize,
    top: top + position.y,
    left: left + position.x
  };
  return (
    <button
      style={buttonStyle}
      className={`simple-translate-button ${shouldShow ? "isShow" : ""}`}
      onClick={props.handleButtonClick}
    />
  );
};
