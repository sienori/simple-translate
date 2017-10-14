var targetLang = document.getElementById("targetLang");
var ifShowButton = document.getElementsByName("ifShowButton").item(0);
var ifCheckLang = document.getElementsByName("ifCheckLang").item(0);
var ifShowMenu = document.getElementsByName("ifShowMenu").item(0);
var ifChangeSecondLang = document.getElementsByName("ifChangeSecondLang").item(0);
var secondTargetLang = document.getElementById("secondTargetLang");

targetLang.innerHTML=browser.i18n.getMessage("langList");
secondTargetLang.innerHTML=browser.i18n.getMessage("langList");

document.getElementById("targetLangLabel").innerHTML=browser.i18n.getMessage("langListLabel");
document.getElementById("ifShowButtonLabel").innerHTML=browser.i18n.getMessage("ifShowButtonLabel");
document.getElementById("ifCheckLangLabel").innerHTML=browser.i18n.getMessage("ifCheckLangLabel");
document.getElementById("ifShowMenuLabel").innerHTML=browser.i18n.getMessage("ifShowMenuLabel");
document.getElementById("ifChangeSecondLangLabel").innerHTML=browser.i18n.getMessage("ifChangeSecondLangLabel");
document.getElementById("secondTargetLangLabel").innerHTML=browser.i18n.getMessage("secondTargetLangLabel");

//設定を読み込んで反映
browser.storage.local.get(["targetLang", "ifShowButton", "ifCheckLang", "ifShowMenu", "ifChangeSecondLang", "secondTargetLang"], function (value) {
    targetLang.value = value.targetLang;
    ifShowButton.checked=value.ifShowButton;
    ifCheckLang.checked=value.ifCheckLang;
    ifShowMenu.checked=value.ifShowMenu;
    ifChangeSecondLang.checked=value.ifChangeSecondLang;
    secondTargetLang.value=value.secondTargetLang;
});

function save() {
    browser.storage.local.set({
        'targetLang': targetLang.value,
        'ifShowButton': ifShowButton.checked,
        'ifCheckLang': ifCheckLang.checked,
        'ifShowMenu': ifShowMenu.checked,
        'ifChangeSecondLang': ifChangeSecondLang.checked,
        'secondTargetLang': secondTargetLang.value
    }, function () {});
}

targetLang.addEventListener("change", save);
ifShowButton.addEventListener("change", save);
ifCheckLang.addEventListener("change", save);
ifShowMenu.addEventListener("change", save);
ifChangeSecondLang.addEventListener("change", save);
secondTargetLang.addEventListener("change", save);