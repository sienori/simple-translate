import React from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import { paypalLink } from "src/common/personalUrls";
import HeartIcon from "../icons/heart.svg";
import SettingsIcon from "../icons/settings.svg";
import "../styles/header.scss";

const openPayPal = () => {
  openUrl(paypalLink);
};
const openSettings = () => {
  const url = "../options/index.html#settings";
  openUrl(url);
};

export default () => (
  <div id="header">
    <div className="title">Simple Translate</div>
    <div className="rightButtons">
      <button
        className="heartButton"
        onClick={openPayPal}
        title={browser.i18n.getMessage("donateWithPaypalLabel")}
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
