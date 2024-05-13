import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import log from "loglevel";
import { getSettings, setSettings } from "src/settings/settings";
import getShortcut from "src/common/getShortcut";
import manifest from "src/manifest-chrome.json";
import openUrl from "../common/openUrl";
import { initSettings } from "../settings/settings";

const logDir = "background/keyboardShortcuts";

export const initShortcuts = async () => {
  const isValidShortcuts = browserInfo().name == "Firefox" && browserInfo().version >= 60;
  if (!isValidShortcuts) return;
  log.info(logDir, "initShortcuts()");

  let initedShortcuts = getSettings("initedShortcuts") || [];

  const commands = manifest.commands;
  for (const commandId of Object.keys(commands)) {
    if (initedShortcuts.includes(commandId)) continue;

    try {
      await browser.commands.update({ name: commandId, shortcut: getShortcut(commandId) });
      initedShortcuts.push(commandId);
    } catch (e) {
      log.error(logDir, "initShortcuts()", e);
    }
  }
  setSettings("initedShortcuts", initedShortcuts);
};

export const onCommandListener = async command => {
  log.log(logDir, "onCommandListener()", command);
  await initSettings();
  switch (command) {
    case "translateSelectedText": {
      translateSelectedText();
      break;
    }
    case "translatePage": {
      translatePage();
      break;
    }
  }
};

const translateSelectedText = async () => {
  const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
  browser.tabs.sendMessage(tab.id, {
    message: "translateSelectedText"
  });
};
const translatePage = async () => {
  const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
  const tabUrl = await browser.tabs.sendMessage(tab.id, { message: "getTabUrl" });

  const targetLang = getSettings("targetLang");
  const encodedPageUrl = encodeURIComponent(tabUrl);
  const translationUrl = `https://translate.google.com/translate?hl=${targetLang}&tl=${targetLang}&sl=auto&u=${encodedPageUrl}`;
  const isCurrentTab = getSettings("pageTranslationOpenTo") === "currentTab";

  openUrl(translationUrl, isCurrentTab);
};
