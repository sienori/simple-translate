/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate-button'></div><div id='simple-translate-panel'><p>...</p></div>"); //body末尾にボタン配置
var button = document.getElementById("simple-translate-button");
var panel = document.getElementById("simple-translate-panel");
var selectionWord;
var clickPosition;

const S = new settingsObj();
const T = new Translate();
S.init();
window.addEventListener("mouseup", Select, false);
//テキスト選択時の処理 ダブルクリックした時2回処理が走るのを何とかしたい
async function Select(e) {
    hidePanel(e);
    if (e.target.tagName == "INPUT" && e.target.type == "password") return;

    setTimeout(async () => { //誤動作防止の為ディレイを設ける
        //選択文の取得 テキストフィールド内を選択した場合にも対応
        const isTextField = (e.target.tagName == "INPUT") || (e.target.tagName == "TEXTAREA");
        if (isTextField) selectionWord = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
        else selectionWord = String(window.getSelection());

        //選択文が存在し，パネル外を左クリックした場合は翻訳する
        const existsSelectionWord = (selectionWord.length !== 0);
        const isLeftClick = (e.button == 0);
        const isPanelOutside = (e.target.id !== 'simple-translate-panel') && (e.target.parentElement.id !== 'simple-translate-panel');
        const shouldTranslate = existsSelectionWord && isLeftClick && isPanelOutside;
        if (!shouldTranslate) return;

        //選択した言語が翻訳先言語と異なれば翻訳する
        const needTranslate = await checkLang(selectionWord, 'auto', S.get().targetLang);
        if (!needTranslate) return;

        clickPosition = e;
        switch (S.get().whenSelectText) {
            case 'showButton':
                if (selectionWord.length == 0) return;
                popupButton(e);
                break;
            case 'showPanel':
                translate(selectionWord, 'auto', S.get().targetLang);
                if (selectionWord.length == 0) return;
                showPanel(e);
                break;
            case 'dontShowButton':
                break;
        }
    }, 0);
}

//選択テキストの言語をチェックして返す
async function checkLang(sourceWord, sourceLang, targetLang) {
    if (!S.get().ifCheckLang) return true; //設定がオフならtrue
    sourceWord=sourceWord.substr(0, 100); //先頭100字で言語を判定
    
    const resultData = await T.translate(sourceWord, sourceLang, targetLang);
    const needTranslate = (S.get().targetLang != resultData.sourceLanguage) && (resultData.percentage > 0);
    return needTranslate; //ターゲットとソースの言語が不一致ならtrue
}

//ボタンを表示
function popupButton(e) {
    let topPosition = 10;
    let leftPosition = 10;
    let buttonSize = S.get().buttonSize;

    switch (S.get().buttonPosition) {
        case "rightUp":
            topPosition = (-1 * buttonSize) - 10;
            break;
        case "rightDown":
            break;
        case "leftUp":
            topPosition = (-1 * buttonSize) - 10;
            leftPosition = (-1 * buttonSize) - 10;
            break;
        case "leftDown":
            leftPosition = (-1 * buttonSize) - 10;
            break;
    }

    button.style.left = e.clientX + leftPosition + 'px';
    button.style.top = e.clientY + topPosition + 'px';
    button.style.width = S.get().buttonSize + "px";
    button.style.height = S.get().buttonSize + "px";
    button.style.display = 'block';
}
button.addEventListener("click", function (e) {
    translate(selectionWord, 'auto', S.get().targetLang);
    showPanel(e);
}, false);

async function translate(sourceWord, sourceLang, targetLang) {
    const resultData = await T.translate(sourceWord, sourceLang, targetLang);
    showResult(resultData.resultText, resultData.candidateText);
    panelPosition(clickPosition);
}

function showResult(resultText, candidateText) {
    panel.innerHTML = '<p class=result></p><p class=candidate>';
    const resultArea = panel.getElementsByClassName("result")[0];
    const candidateArea = panel.getElementsByClassName("candidate")[0];

    resultArea.innerText = resultText;
    if (S.get().ifShowCandidate) candidateArea.innerText = candidateText;
}

//パネル表示
function showPanel(e) {
    clickPosition = e;
    panel.style.display = 'block';
    panelPosition(e);
}

//パネル非表示
function hidePanel(e) {
    button.style.display = 'none'; //ボタンを非表示
    if ((e.target.id !== "simple-translate-panel") && (e.target.parentElement.id !== "simple-translate-panel")) { //パネル以外の場所をクリックでパネルを非表示
        panel.style.display = 'none';
        panel.innerHTML = "<p>...</p>";
    }
}

//パネルがウィンドウ外にはみ出る時に位置を調整
function panelPosition(e) {
    var p = new Object();
    panel.style.width = S.get().width + 'px'; //300px
    var panelHeight = panel.clientHeight;
    var panelWidth = parseInt(window.getComputedStyle(panel.getElementsByTagName("p")[0], null).width);
    //一旦パネルの横幅を300にしてpの横幅を取得

    if (e.clientX + panelWidth > window.innerWidth - 80) {
        p.x = window.innerWidth - panelWidth - 80;
    } else {
        p.x = e.clientX;
    }
    if (e.clientY + panelHeight > window.innerHeight - 30) {
        p.y = window.innerHeight - panelHeight - 30;
    } else {
        p.y = e.clientY;
    }
    panel.style.width = 'auto'; //panelWidth + 'px';
    panel.style.top = p.y + 'px';
    panel.style.left = p.x + 'px';

    panel.style.maxWidth = S.get().width + "px";
    panel.style.maxHeight = S.get().height + "px";
    panel.style.fontSize = S.get().fontSize + "px";
    panel.style.backgroundColor = S.get().bgColor;
}


//スクリプトからのメッセージに返信
browser.runtime.onMessage.addListener(function (request) {
    switch (request.message) {
        case "fromPopup":
            return sendToPopup();
            break;
        case "showPanelFromMenu":
            showPanelFromMenu();
            break;
    }
});

//popupにテキストとurlを返す
function sendToPopup() {
    return Promise.resolve({
        word: String(window.getSelection()),
        url: window.location.href
    });
}

//コンテキストメニュークリックでパネルを表示
function showPanelFromMenu() {
    button.style.display = "none";
    translate(selectionWord, 'auto', S.get().targetLang);
    showPanel(clickPosition);
}
