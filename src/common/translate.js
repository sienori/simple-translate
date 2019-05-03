import log from "loglevel";
let translationHistory = [];

const logDir = "common/translate";

const getHistory = (sourceWord, sourceLang, targetLang) => {
  const history = translationHistory.find(
    history =>
      history.sourceWord == sourceWord &&
      history.sourceLang == sourceLang &&
      history.targetLang == targetLang &&
      history.result.statusText == "OK"
  );
  return history;
};

const setHistory = (sourceWord, sourceLang, targetLang, formattedResult) => {
  translationHistory.push({
    sourceWord: sourceWord,
    sourceLang: sourceLang,
    targetLang: targetLang,
    result: formattedResult
  });
};

const sendRequest = (word, sourceLang, targetLang) => {
  log.log(logDir, "sendRequest()");
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
};

const formatResult = result => {
  const resultData = {
    resultText: "",
    candidateText: "",
    sourceLanguage: "",
    percentage: 0,
    statusText: ""
  };

  if (result.status === 0) resultData.statusText = "Network Error";
  else if (result.status === 200) resultData.statusText = "OK";
  else if (result.status === 429) resultData.statusText = "Service Unavailable";
  else if (result.status === 503) resultData.statusText = "Service Unavailable";
  else resultData.statusText = result.statusText || result.status;

  if (resultData.statusText !== "OK") {
    log.error(logDir, "formatResult()", resultData);
    return resultData;
  }

  resultData.sourceLanguage = result.response.src;
  resultData.percentage = result.response.confidence;
  resultData.resultText = result.response.sentences.map(sentence => sentence.trans).join("");
  if (result.response.dict) {
    resultData.candidateText = result.response.dict
      .map(dict => `${dict.pos}${dict.pos != "" ? ": " : ""}${dict.terms.join(", ")}\n`)
      .join("");
  }

  log.log(logDir, "formatResult()", resultData);
  return resultData;
};

export default async (sourceWord, sourceLang = "auto", targetLang) => {
  log.log(logDir, "tranlate()", sourceWord, targetLang);
  sourceWord = sourceWord.trim();
  if (sourceWord === "")
    return {
      resultText: "",
      candidateText: "",
      sourceLanguage: "en",
      percentage: 0,
      statusText: "OK"
    };

  const history = getHistory(sourceWord, sourceLang, targetLang);
  if (history) return history.result;

  const result = await sendRequest(sourceWord, sourceLang, targetLang);
  const formattedResult = formatResult(result);
  setHistory(sourceWord, sourceLang, targetLang, formattedResult);
  return formattedResult;
};
