import browser from "webextension-polyfill";

export default async url => {
  const activeTab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
  browser.tabs.create({ url: url, index: activeTab.index + 1 });
};
