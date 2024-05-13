import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, handleSettingsChange } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import onInstalledListener from "./onInstalledListener";
import { showMenus, onMenusShownListener, onMenusClickedListener } from "./menus";
import { onCommandListener } from "./keyboardShortcuts";
import onMessageListener from "./onMessageListener";

const logDir = "background/background";

browser.runtime.onInstalled.addListener(onInstalledListener);
browser.commands.onCommand.addListener(onCommandListener);
browser.runtime.onMessage.addListener(onMessageListener);
browser.storage.local.onChanged.addListener((changes) => {
  handleSettingsChange(changes);
  updateLogLevel();
  showMenus();
});

if (!!browser.contextMenus?.onShown) browser.contextMenus.onShown.addListener(onMenusShownListener);
browser.contextMenus.onClicked.addListener(onMenusClickedListener);

const init = async () => {
  await initSettings();
  overWriteLogLevel();
  updateLogLevel();
  log.info(logDir, "init()");
  showMenus();
};
init();
