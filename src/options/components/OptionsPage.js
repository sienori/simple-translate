import React from "react";
import browser from "webextension-polyfill";
import { HashRouter } from "react-router-dom";
import { initSettings, getSettings } from "../../settings/settings";
import SideBar from "./SideBar";
import ContentsArea from "./ContentsArea";
import ScrollToTop from "./ScrollToTop";
import "../styles/OptionsPage.scss";

const setupTheme = async () => {
  await initSettings();
  document.body.classList.add(getSettings("theme") + "-theme");

  browser.storage.onChanged.addListener((changes) => {
    if (changes.Settings.newValue.theme === changes.Settings.oldValue.theme)
      return;

    document.body.classList.replace(
      changes.Settings.oldValue.theme + "-theme",
      changes.Settings.newValue.theme + "-theme"
    );
  });
};

export default () => {
  setupTheme();
  return (
    <HashRouter hashType="noslash">
      <ScrollToTop>
        <div className="optionsPage">
          <SideBar />
          <ContentsArea />
        </div>
      </ScrollToTop>
    </HashRouter>
  );
};
