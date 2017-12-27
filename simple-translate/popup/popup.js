/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let S = new settingsObj();
//設定を読み出し
S.init().then(function (value) {
    defaultTargetLang = value.targetLang;
    targetLang = value.targetLang;
    secondTargetLang = value.secondTargetLang;
    ifChangeSecondLang = value.ifChangeSecondLang;
    langList.value = targetLang; //リスト初期値をセット
    langList.addEventListener("change", changeLang);

    document.body.style.fontSize = value.fontSize;
})

let target = document.getElementById("target");
let langList = document.getElementById("langList");
let textarea = document.getElementById("textarea");

langList.innerHTML = browser.i18n.getMessage("langList");
const initialText = browser.i18n.getMessage("initialTextArea");
textarea.placeholder = initialText;

let targetLang;
let secondTargetLang;
let defaultTargetLang;
let ifChangeSecondLang;
let sourceWord = "";

/*
//Firefoxの仕様上popup.htmlでfocusが効かないため使えない
textarea.focus();
document.execCommand("paste");
*/

//翻訳先言語変更時に更新
function changeLang() {
    targetLang = langList.value;
    if (sourceWord !== "") {
        translate();
    }
    if (url !== "") showLink();
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
    document.getElementById("link").innerHTML = "<a href=https://translate.google.com/translate?hl=" + targetLang + "&sl=auto&u=" + encodeURIComponent(url) + ">" + browser.i18n.getMessage('showLink') + "</a>";
}

//翻訳元テキストを表示
function refleshSource() {
    if (sourceWord !== "") {
        textarea.innerHTML = sourceWord;
        translate();
        resize();
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
function inputText() {
    sourceWord = textarea.value;
    translate();
}

//改行で分割してgetRequestに渡す
function translate() {
    let promises = [];
    sourceLine = sourceWord.split("\n");
    for (i = 0; i < sourceLine.length; i++) {
        promises.push(getRequest(sourceLine[i]));
    }
    Promise.all(promises)
        .then(function (results) {
            showResult(results); //翻訳結果が帰ってきたらshowResult
        });
}

//翻訳リクエストを送信，取得して返す
function getRequest(word) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        //let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(word);
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + targetLang + "&dt=t&dt=bd&q=" + encodeURIComponent(word);

        xhr.open("GET", url);
        xhr.send();
        xhr.onload = function () {
            resolve(xhr);
        };
    })
}

//翻訳結果を表示
function showResult(results) {
    const resultArea = target.getElementsByClassName("result")[0];
    const candidateArea = target.getElementsByClassName("candidate")[0];
    resultArea.innerText = "";
    candidateArea.innerText = "";

    let resultText = "";
    let candidateText = "";
    let wordsCount = 0;
    let lineCount = 0;

    //第二言語に変更
    if (ifChangeSecondLang) {
        let lang = results[0].response[2];
        let percentage = results[0].response[6];
        if (targetLang == defaultTargetLang && lang == defaultTargetLang && percentage > 0 && !changeLangFlag) changeSecondLang();
        else if ((lang != defaultTargetLang || percentage == 0) && changeLangFlag) unchangeSecondLang();
    }
    for (let j = 0; j < results.length; j++) {
        lineCount++;
        for (let i = 0; i < results[j].response[0].length; i++) {
            resultText += results[j].response[0][i][0];
        }
        resultText += "\n";

        if (results[j].response[1]) {
            wordsCount++;
            for (let i = 0; i < results[j].response[1].length; i++) {
                const partsOfSpeech = results[j].response[1][i][0];
                const candidates = results[j].response[1][i][1];
                candidateText += `\n${partsOfSpeech}${partsOfSpeech!="" ? ": " : ""}${candidates.join(", ")}`;
            }
        }
    }
    resultArea.innerText = resultText;
    if (S.get().ifShowCandidate && wordsCount == 1 && lineCount == 1) candidateArea.innerText = candidateText;
}

let changeLangFlag = false;

function changeSecondLang() {
    changeLangFlag = true;
    langList.value = secondTargetLang;
    changeLang();
}

function unchangeSecondLang() {
    changeLangFlag = false;
    langList.value = defaultTargetLang;
    changeLang();
}
