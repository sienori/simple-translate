import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import log from "loglevel";
import { getSettings } from "src/settings/settings";

const logDir = "background/menus";

export const showMenus = () => {
  if (getSettings("ifShowMenu")) {
    removeMenus();
    createMenus();
  } else removeMenus();
};

export const onMenusShownListener = (info, tab) => {
  //テキストまたはリンクの選択時はページ翻訳を非表示にする
  if (
    info.contexts.includes("selection") ||
    info.contexts.includes("link") ||
    info.contexts.includes("image")
  ) {
    browser.contextMenus.update("translatePage", { visible: false });
  } else {
    browser.contextMenus.update("translatePage", { visible: true });
  }
  browser.contextMenus.refresh();
};

export const onMenusClickedListener = (info, tab) => {
  log.log(logDir, "onMenusClickedListener()", info, tab);
  switch (info.menuItemId) {
    case "translatePage":
    case "translatePageOnTab":
      translatePage(info, tab);
      break;
    case "translateText":
      translateText(tab);
      break;
    case "translateLink":
      translateLink(info, tab);
      break;
    case "translateImage":
      translateImage(info, tab);
      break;
  }
};

function createMenus() {
  const isValidContextsTypeTab = browserInfo().name === "Firefox" && browserInfo().version >= 53;
  if (isValidContextsTypeTab) {
    browser.contextMenus.create({
      id: "translatePageOnTab",
      title: browser.i18n.getMessage("translatePageMenu"),
      contexts: ["tab"]
    });
  }

  browser.contextMenus.create({
    id: "translatePage",
    title: browser.i18n.getMessage("translatePageMenu"),
    contexts: ["all"],
    visible: true
  });

  browser.contextMenus.create({
    id: "translateText",
    title: browser.i18n.getMessage("translateTextMenu"),
    contexts: ["selection"]
  });

  browser.contextMenus.create({
    id: "translateLink",
    title: browser.i18n.getMessage("translateLinkMenu"),
    contexts: ["link"]
  });

  browser.contextMenus.create({
    id: "translateImage",
    title: browser.i18n.getMessage("translateImageMenu"),
    contexts: ["image"]
  });
}

function removeMenus() {
  browser.contextMenus.removeAll();
}

function translateText(tab) {
  browser.tabs.sendMessage(tab.id, {
    message: "translateSelectedText"
  });
}

function translatePage(info, tab) {
  const targetLang = getSettings("targetLang");
  const encodedPageUrl = encodeURIComponent(info.pageUrl);
  const translationUrl = `https://translate.google.com/translate?hl=${targetLang}&tl=${targetLang}&sl=auto&u=${encodedPageUrl}`;
  const isCurrentTab = getSettings("pageTranslationOpenTo") === "currentTab";

  if (isCurrentTab) {
    browser.tabs.update(tab.id, {
      url: translationUrl
    });
  } else {
    browser.tabs.create({
      url: translationUrl,
      active: true,
      index: tab.index + 1
    });
  }
}

function translateLink(info, tab) {
  const targetLang = getSettings("targetLang");
  const encodedLinkUrl = encodeURIComponent(info.linkUrl);
  const translationUrl = `https://translate.google.com/translate?hl=${targetLang}&tl=${targetLang}&sl=auto&u=${encodedLinkUrl}`;

  browser.tabs.create({
    url: translationUrl,
    active: true,
    index: tab.index + 1
  });
}

function translateImage(info, tab) {
  const targetLang = getSettings("targetLang");
  const translationUrl = `https://translate.google.com/?hl=${targetLang}&tl=${targetLang}&sl=auto&op=images`;

  const canvas = document.createElement("canvas");
  const img = new Image();

  img.crossOrigin = "anonymous";

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);

    canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);

      browser.tabs.create({
        url: translationUrl,
        active: true,
        index: tab.index + 1
      });
    }, "image/png");
  };

  img.src = info.srcUrl;
}
