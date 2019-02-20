/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class Translate {
  constructor() {
    this.history = [];
  }

  getHistory(sourceWord, sourceLang, targetLang) {
    const history = this.history.find(
      history =>
        history.sourceWord == sourceWord &&
        history.sourceLang == sourceLang &&
        history.targetLang == targetLang &&
        history.result.statusText == "OK"
    );
    return history;
  }

  setHistory(sourceWord, sourceLang, targetLang, formattedResult) {
    this.history.push({
      sourceWord: sourceWord,
      sourceLang: sourceLang,
      targetLang: targetLang,
      result: formattedResult
    });
  }

  async translate(sourceWord, sourceLang = "auto", targetLang) {
    sourceWord = sourceWord.trim();

    const history = this.getHistory(sourceWord, sourceLang, targetLang);
    if (history) return history.result;

    const result = await this.sendRequest(sourceWord, sourceLang, targetLang);
    const formattedResult = this.formatResult(result);
    this.setHistory(sourceWord, sourceLang, targetLang, formattedResult);

    return formattedResult;
  }

  sendRequest(word, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
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
      xhr.onerror = () => {
        resolve(xhr);
      };
    });
  }

  formatResult(result) {
    const resultData = {
      resultText: "",
      candidateText: "",
      sourceLanguage: "",
      percentage: 0,
      statusText: ""
    };

    resultData.statusText = result.statusText;
    if (resultData.statusText !== "OK") return resultData;

    resultData.sourceLanguage = result.response.src;
    resultData.percentage = result.response.confidence;
    resultData.resultText = result.response.sentences.map(sentence => sentence.trans).join("");
    if (result.response.dict) {
      resultData.candidateText = result.response.dict
        .map(dict => `${dict.pos}${dict.pos != "" ? ": " : ""}${dict.terms.join(", ")}\n`)
        .join("");
    }

    return resultData;
  }
}
