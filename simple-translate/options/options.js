/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const S = new settingsObj()
let targetLang = document.getElementById("targetLang");
let secondTargetLang = document.getElementById("secondTargetLang");

setLangList();

function setLangList() {
    let langList = browser.i18n.getMessage("langList");
    langList = langList.split(", ");

    for (let i in langList) {
        langList[i] = langList[i].split(":");
    }
    langList = langList.sort(alphabeticallySort);

    let langListHtml = "";
    for (let i of langList) {
        langListHtml += `<option value=${i[0]}>${i[1]}</option>`
    }
    targetLang.innerHTML = langListHtml;
    secondTargetLang.innerHTML = langListHtml;

}

function alphabeticallySort(a, b) {
    if (a[1].toString() > b[1].toString()) {
        return 1;
    } else {
        return -1;
    }
}

S.initOptionsPage().then(function () {
    const saveByChangeItems = document.getElementsByClassName("saveByChange");
    for (let item of saveByChangeItems) {
        item.addEventListener("change", save)
    }
})

function save() {
    S.saveOptionsPage();
}
