var style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerHTML = "" +
    "#simple-translate-button {" +
    "background-color :rgba(87, 199, 232, 0.6);" +
    "height :20px;" +
    "width :20px;" +
    "position :fixed;" +
    "z-index: 150;" +
    "left :0px;" +
    "top :0px;" +
    "display :none;" +
    "cursor :pointer;" +
    "}";
document.getElementsByTagName("head")[0].appendChild(style); //headに上記スタイルを追記
document.body.insertAdjacentHTML("beforeend", "<div id='simple-translate-button'></div>"); //body末尾にボタン配置

var button = document.getElementById("simple-translate-button");
var selectionWord;

function showPanel() {
    console.log(selectionWord);
}

function popupButton(e) {
    button.style.display = 'block';
    button.style.left = e.clientX + 20 + 'px';
    button.style.top = e.clientY + 0 + 'px';
}

function Select(e) {
    button.style.display = 'none'; //マウスクリックでボタンを非表示に
    setTimeout(function () { //誤動作防止の為ディレイを設ける
        selectionWord = String(window.getSelection());
        if (selectionWord.length !== 0 && e.button == 0) { //選択範囲が存在かつ左クリックのとき
            popupButton(e);
        }
    }, 100);
}
window.addEventListener("mouseup", Select, false);
button.addEventListener("click", showPanel, false);