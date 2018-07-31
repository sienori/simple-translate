/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Translate {
  constructor() {}

  set sourceWord(word) {
    this.sourceWord = word;
  }

  translate(sourceWord, sourceLang = "auto", targetLang) {
    //改行で分割
    const sourceLines = sourceWord.trim().split("\n");

    let promises = [];
    for (let sourceLine of sourceLines) {
      promises.push(this.sendRequest(sourceLine, sourceLang, targetLang));
    }

    return new Promise(resolve => {
      Promise.all(promises).then(results => {
        resolve(this.formatResult(results));
      });
    });
  }

  sendRequest(word, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&q=${encodeURIComponent(
      word
    )}`;
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET", url);
    xhr.send();

    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        resolve(xhr);
      };
    });
  }

  formatResult(results) {
    const resultData = {
      resultText: "",
      candidateText: "",
      sourceLanguage: "",
      percentage: 0
    };

    //翻訳元言語を取得
    resultData.sourceLanguage = results[0].response[2];
    resultData.percentage = results[0].response[6];

    let candidateText = "";
    let wordCount = 0;
    let lineCount = 0;

    for (const result of results) {
      lineCount++;

      //翻訳文を取得
      for (const response of result.response[0]) {
        resultData.resultText += response[0];
      }
      resultData.resultText += "\n";

      //訳候補を取得
      if (result.response[1]) {
        wordCount++;
        for (let i = 0; i < result.response[1].length; i++) {
          const partsOfSpeech = result.response[1][i][0];
          const candidates = result.response[1][i][1];
          candidateText += `${partsOfSpeech}${partsOfSpeech != "" ? ": " : ""}${candidates.join(
            ", "
          )}\n`;
        }
      }
    }
    //訳候補が一つの単語のみに対して存在するとき返す
    if (wordCount == 1 && lineCount == 1) resultData.candidateText = candidateText;

    return resultData;
  }
}
