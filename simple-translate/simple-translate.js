document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate-button'></div><div id='simple-translate-panel'><p>...</p></div><div id='simple-translate-popup'></div>"); //body末尾にボタン配置
var button = document.getElementById("simple-translate-button");
var panel = document.getElementById("simple-translate-panel");
var popup = document.getElementById("simple-translate-popup");
var selectionWord;
var clickPosition;

var targetLang;
var ifShowButton;
var ifCheckLang;

//設定を読み出し
getSetting();
browser.storage.onChanged.addListener(getSetting);

function getSetting() {
    browser.storage.sync.get(["targetLang", "ifShowButton", "ifCheckLang"], function (value) {
        targetLang = value.targetLang;
        ifShowButton = value.ifShowButton;
        ifCheckLang = value.ifCheckLang;
    });
}

window.addEventListener("mouseup", Select, false);
//テキスト選択時の処理
function Select(e) {
    hidePanel(e);
    setTimeout(function () { //誤動作防止の為ディレイを設ける
        selectionWord = String(window.getSelection());
        if ((selectionWord.length !== 0) && (e.button == 0) && (e.target.id !== "simple-translate-panel") && (e.target.parentElement.id !== "simple-translate-panel")) { //選択範囲が存在かつ左クリックかつパネル以外のとき
                popupButton(e);
        }
    }, 200);
}

//選択テキストの言語をチェックして返す
function checkLang() {
    return new Promise(function (resolve, reject) {
        getRequest(selectionWord.substr(0, 100)) //先頭100文字を抽出
            .then(function (results) {
                let lang = results.response[2];
                let percentage = results.response[6];
                //console.log(lang, percentage, lang!=targetLang && percentage>0);
                resolve(lang != targetLang && percentage > 0); //真偽値を返す
            });
    })
}

//ボタンを表示
function popupButton(e) {
    button.style.left = e.clientX + 10 + 'px';
    button.style.top = e.clientY + 5 + 'px';
    if (ifShowButton) {
        if (ifCheckLang) {
                checkLang().then(function (results) {
                        if (results) button.style.display = 'block';
                });
        } else {
                button.style.display = 'block';
        }
    }
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
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(word);
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
    for (let j = 0; j < results.length; j++) {
        for (let i = 0; i < results[j].response[0].length; i++) {
            resultText += results[j].response[0][i][0];
        }
        resultText += "\n"; //
    }
    panel.innerHTML = "<p></p>"
    panel.getElementsByTagName("p")[0].innerText = resultText;
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
    panel.style.width = '300px';
    var panelHeight = panel.clientHeight;
    var panelWidth = parseInt(window.getComputedStyle(panel.getElementsByTagName("p")[0], null).width);
    //一旦パネルの横幅を300にしてpの横幅を取得

    if (e.clientX + panelWidth > window.innerWidth - 80) {
        p.x = window.innerWidth - panelWidth - 80;
    } else {
        p.x = e.clientX + 10;
    }
    if (e.clientY + panelHeight > window.innerHeight - 30) {
        p.y = window.innerHeight - panelHeight - 30;
    } else {
        p.y = e.clientY + 10;
    }
    panel.style.width = 'auto'; //panelWidth + 'px';
    panel.style.top = p.y + 'px';
    panel.style.left = p.x + 'px';
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
    let event = new Object();
    event.clientX = parseInt(button.style.left);
    event.clientY = parseInt(button.style.top);
    showPanel(event);
}
