var targetLang = document.getElementById("targetLang");
var ifShowButton = document.getElementsByName("ifShowButton").item(0);
var ifCheckLang = document.getElementsByName("ifCheckLang").item(0);
var ifShowMenu = document.getElementsByName("ifShowMenu").item(0);

targetLang.innerHTML=browser.i18n.getMessage("langList");
document.getElementById("targetLangLabel").innerHTML=browser.i18n.getMessage("langListLabel");
document.getElementById("ifShowButtonLabel").innerHTML=browser.i18n.getMessage("ifShowButtonLabel");
document.getElementById("ifCheckLangLabel").innerHTML=browser.i18n.getMessage("ifCheckLangLabel");
document.getElementById("ifShowMenuLabel").innerHTML=browser.i18n.getMessage("ifShowMenuLabel");

//設定を読み込んで反映
browser.storage.sync.get(["targetLang", "ifShowButton", "ifCheckLang", "ifShowMenu"], function (value) {
    targetLang.value = value.targetLang;
    ifShowButton.checked=value.ifShowButton;
    ifCheckLang.checked=value.ifCheckLang;
    ifShowMenu.checked=value.ifShowMenu;
});

function save() {
    browser.storage.sync.set({
        'targetLang': targetLang.value,
        'ifShowButton': ifShowButton.checked,
        'ifCheckLang': ifCheckLang.checked,
        'ifShowMenu': ifShowMenu.checked
    }, function () {});
}

targetLang.addEventListener("change", save);
ifShowButton.addEventListener("change", save);
ifCheckLang.addEventListener("change", save);
ifShowMenu.addEventListener("change", save);