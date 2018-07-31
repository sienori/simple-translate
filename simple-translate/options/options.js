/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const S = new settingsObj();
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
    langListHtml += `<option value=${i[0]}>${i[1]}</option>`;
  }
  targetLang.innerHTML = langListHtml;
  secondTargetLang.innerHTML = langListHtml;

  initialSetting();
}

function alphabeticallySort(a, b) {
  if (a[1].toString() > b[1].toString()) {
    return 1;
  } else {
    return -1;
  }
}

function initialSetting() {
  switch (
    browser.i18n.getUILanguage() //一部の言語はブラウザの設定に合わせる
  ) {
    case "ja":
    case "zh-CN":
    case "zh-TW":
    case "ko":
    case "ru":
    case "de":
    case "fr":
    case "it":
      targetLang.value = browser.i18n.getUILanguage();
      secondTargetLang.value = "en";
      break;
    default:
      targetLang.value = "en";
      secondTargetLang.value = "ja";
      break;
  }
}

S.initOptionsPage().then(function() {
  const saveByChangeItems = document.getElementsByClassName("saveByChange");
  for (let item of saveByChangeItems) {
    item.addEventListener("change", save);
  }
});

function save() {
  S.saveOptionsPage();
}
