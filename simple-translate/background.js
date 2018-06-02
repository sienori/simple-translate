/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//初回起動時にオプションページを表示して設定を初期化
browser.runtime.onInstalled.addListener(function () {
    browser.tabs.create({
        url: "options/options.html#information",
        active: false
    });
});

let S = new settingsObj()
browser.storage.onChanged.addListener(showMenu);

S.init().then(function () {
    showMenu();
});

function showMenu() {
    if (S.get().ifShowMenu) {
        menuRemove();
        menuCreate();
    } else menuRemove();
}

//メニューを表示
function menuCreate() {
    browser.contextMenus.create({
        id: "translatePageOnTab",
        title: browser.i18n.getMessage("translatePageMenu"),
        contexts: ["tab"],
    });

    browser.contextMenus.create({
        id: "translatePage",
        title: browser.i18n.getMessage("translatePageMenu"),
        contexts: ["all"],
    });

    browser.contextMenus.create({
        id: "translateText",
        title: browser.i18n.getMessage("translateTextMenu"),
        contexts: ["selection"],
    });

    browser.contextMenus.create({
        id: "translateLink",
        title: browser.i18n.getMessage("translateLinkMenu"),
        contexts: ["link"],
    });
}

//メニューを削除
function menuRemove() {
    browser.contextMenus.removeAll();
}


//メニュークリック時
browser.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case "translatePage":
        case "translatePageOnTab":
            translatePageMenu(info, tab);
            break;
        case "translateText":
            translateTextMenu(info, tab);
            break;
        case "translateLink":
            translateLinkMenu(info, tab);
            break;
    }
});

//テキストを翻訳
function translateTextMenu(info, tab) {
    browser.tabs.sendMessage(
        tab.id, {
            message: "showPanelFromMenu"
        }
    )
}

//ページ全体を翻訳
function translatePageMenu(info, tab) {
    browser.tabs.create({
        'url': "https://translate.google.com/translate?hl=" + S.get().targetLang + "&sl=auto&u=" + encodeURIComponent(info.pageUrl),
        'active': true,
        'index': tab.index + 1
    });
}

//リンクを翻訳
function translateLinkMenu(info, tab) {
    browser.tabs.create({
        'url': "https://translate.google.com/translate?hl=" + S.get().targetLang + "&sl=auto&u=" + encodeURIComponent(info.linkUrl),
        'active': true,
        'index': tab.index + 1
    });
}

//スクリプトからのメッセージに返信
browser.runtime.onMessage.addListener(function (request) {
    switch (request.message) {
        case "getSetting":
            break;
    }
});
