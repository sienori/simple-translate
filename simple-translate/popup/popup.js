let target = document.getElementById("target");
let langList = document.getElementById("langList");
let textarea = document.getElementById("textarea");

const initialText = browser.i18n.getMessage("initialTextArea");
langList.innerHTML = browser.i18n.getMessage("langList");
textarea.innerText = initialText;

let targetLang;
let sourceWord = "";

browser.storage.onChanged.addListener(getTargetLang);
getTargetLang(); //翻訳先言語初期化
//設定を読み出し
function getTargetLang() {
    browser.storage.sync.get("targetLang", function (value) {
        targetLang = value.targetLang;
        langList.value = targetLang; //リスト初期値をセット
        langList.addEventListener("change", changeLang);
    });
}

//翻訳先言語変更時に更新
function changeLang() {
    targetLang = langList.value;
    if (sourceWord !== "") {
        removeResult();
        splitLine();
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
    document.getElementById("link").innerHTML = "<a href=https://translate.google.co.jp/translate?hl=" + targetLang + "&sl=auto&u=" + encodeURIComponent(url) + ">" + browser.i18n.getMessage('showLink') + "</a>";
}

//翻訳元テキストを表示
function refleshSource() {
    if (sourceWord !== "") {
        textarea.innerHTML = sourceWord;
        translate();
        resize();
    }
}

textarea.addEventListener("keydown", resize);
//テキストボックスをリサイズ
function resize() {
    setTimeout(function () {
        textarea.style.height = "0px";
        textarea.style.height = parseInt(textarea.scrollHeight) + "px";
    }, 0);
}

//テキストエリアクリック時の処理
textarea.addEventListener("click", textAreaClick, {
    once: true
});

function textAreaClick() {
    if (textarea.value == initialText) {
        textarea.value = "";
    } else {
        textarea.select();
    }
}

textarea.addEventListener("keyup", inputText);
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
    target.innerText = "";
    let resultText = "";
    for (let j = 0; j < results.length; j++) {
        for (let i = 0; i < results[j].response[0].length; i++) {
            resultText += results[j].response[0][i][0];
        }
        resultText += "\n"; //
    }
    target.innerText = resultText;
}
