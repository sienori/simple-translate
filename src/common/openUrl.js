import browser from "webextension-polyfill";

export default async (url, isCurrentTab = false) => {
  const activeTab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];

  if (isCurrentTab) browser.tabs.update({ url: url });
  else browser.tabs.create({ url: url, index: activeTab.index + 1 });
};
