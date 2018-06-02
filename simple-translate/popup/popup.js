/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const S = new settingsObj();
const T = new Translate();

//設定を読み出し
S.init().then(function (value) {
    defaultTargetLang = value.targetLang;
    secondTargetLang = value.secondTargetLang;
    ifChangeSecondLang = value.ifChangeSecondLang;
    langList.value = value.targetLang; //リスト初期値をセット
    langList.addEventListener("change", changeLang);

    document.body.style.fontSize = value.fontSize;
})

let target = document.getElementById("target");
let langList = document.getElementById("langList");
let textarea = document.getElementById("textarea");

const initialText = browser.i18n.getMessage("initialTextArea");
textarea.placeholder = initialText;

let secondTargetLang;
let defaultTargetLang;
let ifChangeSecondLang;
let sourceWord = "";

setLangList();

function setLangList() {
    let langListStr = browser.i18n.getMessage("langList");
    langListStr = langListStr.split(", ");

    for (let i in langListStr) {
        langListStr[i] = langListStr[i].split(":");
    }
    langListStr = langListStr.sort(alphabeticallySort);

    let langListHtml = "";
    for (let i of langListStr) {
        langListHtml += `<option value=${i[0]}>${i[1]}</option>`
    }

    langList.innerHTML = langListHtml;
}

function alphabeticallySort(a, b) {
    if (a[1].toString() > b[1].toString()) {
        return 1;
    } else {
        return -1;
    }
}

//翻訳先言語変更時に更新
async function changeLang() {
    if (typeof (url) != "undefined") showLink();

    if (sourceWord !== "") {
        const resultData = await T.translate(sourceWord, undefined, langList.value);
        showResult(resultData.resultText, resultData.candidateText);
    }
}

//アクティブなタブを取得して渡す
browser.tabs.query({
    currentWindow: true,
    active: true
}).then(function (tabs) {
    getSelectionWord(tabs);
});

//アクティブタブから選択文字列とurlを取得
function getSelectionWord(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id, {
                message: "fromPopup"
            }
        ).then(response => {
            sourceWord = response.word;
            url = response.url;
            refleshSource();
            showLink();
        });
    }
}

//ページ翻訳へのリンクを表示
function showLink() {
    document.getElementById("link").innerHTML = "<a href=https://translate.google.com/translate?hl=" + langList.value + "&sl=auto&u=" + encodeURIComponent(url) + ">" + browser.i18n.getMessage('showLink') + "</a>";
}

//翻訳元テキストを表示
function refleshSource() {
    if (sourceWord !== "") {
        textarea.innerHTML = sourceWord;
        resize();
        inputText();
    }
}

textarea.addEventListener("paste", resize)

textarea.addEventListener("keydown", resize);

textarea.addEventListener("keyup", function (event) {
    //if (event.keyCode == 13) resize();
    resize();
    inputText();
});

//テキストボックスをリサイズ
function resize() {
    setTimeout(function () {
        textarea.style.height = "0px";
        textarea.style.height = parseInt(textarea.scrollHeight) + "px";
    }, 0);
}

textarea.addEventListener("click", textAreaClick, {
    once: true
});
//テキストエリアクリック時の処理
function textAreaClick() {
    textarea.select();
}

//文字入力時の処理
async function inputText() {
    sourceWord = textarea.value;

    const resultData = await T.translate(sourceWord, 'auto', langList.value);
    changeSecondLang(defaultTargetLang, resultData.sourceLanguage, resultData.percentage);
    showResult(resultData.resultText, resultData.candidateText);
}

function showResult(resultText, candidateText) {
    const resultArea = target.getElementsByClassName("result")[0];
    const candidateArea = target.getElementsByClassName("candidate")[0];

    resultArea.innerText = resultText;
    if (S.get().ifShowCandidate) candidateArea.innerText = candidateText;
}

let changeLangFlag = false;

function changeSecondLang(defaultTargetLang, sourceLang, percentage) {
    //検出された翻訳元言語がターゲット言語と一致
    const equalsSourceAndTarget = sourceLang == langList.value && percentage > 0;

    //検出された翻訳元言語がデフォルト言語と一致
    const equalsSourceAndDefault = sourceLang == defaultTargetLang && percentage > 0;

    if (!changeLangFlag) {
        //通常時
        if (equalsSourceAndTarget && equalsSourceAndDefault) {
            //ソースとターゲットとデフォルトが一致する場合
            //ターゲットを第2言語に変更
            changeLangFlag = true;
            langList.value = secondTargetLang;
            changeLang();
        }
    } else {
        //第2言語に切替した後
        if (!equalsSourceAndDefault) {
            //ソースとデフォルトが異なる場合
            //ターゲットをデフォルトに戻す
            changeLangFlag = false;
            langList.value = defaultTargetLang;
            changeLang();

        }
    }
}
