getSetting();
browser.storage.onChanged.addListener(getSetting)

//設定の読み出し
function getSetting() {
    browser.storage.local.get(["targetLang", "ifShowButton", "ifCheckLang", "ifShowMenu"], function (value) {
        if (value.targetLang == undefined) initialSetting(); //初回起動時
        targetLang = value.targetLang;
        ifShowButton = value.ifShowButton;
        ifCheckLang = value.ifCheckLang;
        ifShowMenu = value.ifShowMenu;
        if (ifShowMenu) menuCreate();
        else menuRemove();
    });
}

//設定の初期化
function initialSetting() {
    switch (browser.i18n.getUILanguage()) { //一部の言語はブラウザの設定に合わせる
        case "ja":
        case "zh-CN":
        case "zh-TW":
        case "ko":
            targetLang = browser.i18n.getUILanguage();
            break;
        default:
            targetLang = "en";
            break;
    }
    browser.storage.local.set({
        'targetLang': targetLang,
        'ifShowButton': true,
        'ifCheckLang': true,
        'ifShowMenu': true
    }, function () {
        getSetting();
    });
}

//メニューを表示
function menuCreate() {
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
        'url': "https://translate.google.co.jp/translate?hl=" + targetLang + "&sl=auto&u=" + encodeURIComponent(info.pageUrl),
        'active': true,
        'index': tab.index + 1
    });
}

//リンクを翻訳
function translateLinkMenu(info, tab) {
    browser.tabs.create({
        'url': "https://translate.google.co.jp/translate?hl=" + targetLang + "&sl=auto&u=" + encodeURIComponent(info.linkUrl),
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
