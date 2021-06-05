import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import log from "loglevel";
import { initSettings, handleSettingsChange } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import onInstalledListener from "./onInstalledListener";
import { showMenus, onMenusShownListener, onMenusClickedListener } from "./menus";
import { onCommandListener } from "./keyboardShortcuts";

const logDir = "background/background";

const addListeners = () => {
  browser.storage.onChanged.addListener((changes, areaName) => {
    handleSettingsChange(changes, areaName);
    updateLogLevel();
    showMenus();
  });
  const isValidMenusOnShown = browserInfo().name === "Firefox" && browserInfo().version >= 60;
  if (isValidMenusOnShown) browser.contextMenus.onShown.addListener(onMenusShownListener);
  browser.contextMenus.onClicked.addListener(onMenusClickedListener);
};

const init = async () => {
  await initSettings();
  overWriteLogLevel();
  updateLogLevel();
  log.info(logDir, "init()");
  addListeners();
  showMenus();
};
init();

browser.runtime.onInstalled.addListener(onInstalledListener);
browser.commands.onCommand.addListener(onCommandListener);
