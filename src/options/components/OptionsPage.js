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
  document.body.dataset.theme = getSettings("theme");

  browser.storage.onChanged.addListener((changes) => {
    if (changes.Settings.newValue.theme === changes.Settings.oldValue.theme) return;
    document.body.dataset.theme = changes.Settings.newValue.theme;
  });
};

const UILanguage =  browser.i18n.getUILanguage()
const rtlLanguage = ['he', 'ar'].includes(UILanguage)
const optionsPageClassName = 'optionsPage' + (rtlLanguage ? ' rtl-language' : '')

export default () => {
  setupTheme();
  return (
    <HashRouter hashType="noslash">
      <ScrollToTop>
        <div className={optionsPageClassName}>
          <SideBar />
          <ContentsArea />
        </div>
      </ScrollToTop>
    </HashRouter>
  );
};
