import React from "react";
import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import openUrl from "src/common/openUrl";
import HeartIcon from "../icons/heart.svg";
import SettingsIcon from "../icons/settings.svg";
import "../styles/header.scss";

//TODO: 次のタブで開く
const openPayPal = () => {
  const isChrome = browserInfo().name === "Chrome";
  const url = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&no_shipping=1&business=sienori.firefox@gmail.com&item_name=SimpleTranslate ${
    isChrome ? "for Chrome " : ""
  }- Donation`;
  openUrl(url);
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
