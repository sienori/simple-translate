/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate-button'></div><div id='simple-translate-panel'><p>...</p></div>"); //body末尾にボタン配置
var button = document.getElementById("simple-translate-button");
var panel = document.getElementById("simple-translate-panel");
var selectionWord;
var clickPosition;

let S = new settingsObj();
S.init();
window.addEventListener("mouseup", Select, false);
//テキスト選択時の処理 ダブルクリックした時2回処理が走るのを何とかしたい
function Select(e) {
    hidePanel(e);
    setTimeout(function () { //誤動作防止の為ディレイを設ける
        //selectionWord = String(window.getSelection());
        if (e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA") {
            selectionWord = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
        } else {
            selectionWord = String(window.getSelection());
        }

        if ((selectionWord.length !== 0) && (e.button == 0) && (e.target.id !== "simple-translate-panel") && (e.target.parentElement.id !== "simple-translate-panel")) { //選択範囲が存在かつ左クリックかつパネル以外のとき
            clickPosition = e;
            if (S.get().ifShowButton) { //ボタンを表示
                checkLang().then(function (results) {
                    if (results) popupButton(e);
                });
            }
        }
    }, 200);
}

//選択テキストの言語をチェックして返す
function checkLang() {
    return new Promise(function (resolve, reject) {
        if (S.get().ifCheckLang) { //設定がオンなら
            getRequest(selectionWord.substr(0, 100)) //先頭100文字を抽出して言語を取得
                .then(function (results) {
                    let lang = results.response[2];
                    let percentage = results.response[6];
                    resolve(lang != S.get().targetLang && percentage > 0); //真偽値を返す
                });
        } else { //設定がオフならtrueを返す
            resolve(true);
        }
    })
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
    translate();
    showPanel(e);
}, false);

//改行で分割してgetRequestに渡す
function translate() {
    promises = [];
    sourceLine = selectionWord.split("\n");
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
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + S.get().targetLang + "&dt=t&dt=bd&q=" + encodeURIComponent(word);
        xhr.open("GET", url);
        xhr.send();
        xhr.onload = function () {
            resolve(xhr);
        };
    })
}

//翻訳結果を表示
function showResult(results) {
    panel.innerText = "";
    let resultText = "";
    let candidateText = "";
    let wordsCount = 0;
    let lineCount = 0;

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
    panel.innerHTML = "<p class=result></p><p class=candidate>"
    panel.getElementsByClassName("result")[0].innerText = resultText;
    if (S.get().ifShowCandidate && wordsCount == 1 && lineCount == 1) panel.getElementsByClassName("candidate")[0].innerText = candidateText;
    panelPosition(clickPosition);

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
    translate();
    showPanel(clickPosition);
}
