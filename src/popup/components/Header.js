import React from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import { patreonLink } from "src/common/personalUrls";
import HeartIcon from "../icons/heart.svg";
import SettingsIcon from "../icons/settings.svg";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "../styles/Header.scss";

const openPatreon = () => {
  openUrl(patreonLink);
};
const openSettings = () => {
  const url = "../options/index.html#settings";
  openUrl(url);
};

const getToggleButtonTitle = isEnabled => {
  return isEnabled
    ? browser.i18n.getMessage("disableOnThisPage")
    : browser.i18n.getMessage("enableOnThisPage");
};

export default props => (
  <div id="header">
    <div className="title">Simple Translate</div>
    <div className="rightButtons">
      <div className="toggleButton" title={getToggleButtonTitle(props.isEnabledOnPage)}>
        <Toggle
          checked={props.isEnabledOnPage}
          onChange={props.toggleEnabledOnPage}
          icons={false}
          disabled={!props.isConnected}
        />
      </div>
      <button
        className="heartButton"
        onClick={openPatreon}
        title={browser.i18n.getMessage("donateLabel")}
      >
        <HeartIcon />
      </button>
      <button
        className={"settingsButton"}
        onClick={openSettings}
        title={browser.i18n.getMessage("settingsLabel")}
      >
        <SettingsIcon />
      </button>
    </div>
  </div>
);
