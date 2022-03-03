import log from "loglevel";
import axios from "axios";
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

const sendRequest = async (word, sourceLang, targetLang) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
    word
  )}`;
  const result = await axios.get(url).catch(error => error.response);

  const resultData = {
    resultText: "",
    candidateText: "",
    sourceLanguage: "",
    percentage: 0,
    isError: false,
    errorMessage: ""
  };

  if (!result || result?.status !== 200) {
    resultData.isError = true;

    if (!result || result.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (result.status === 429 || result.status === 503) resultData.errorMessage = browser.i18n.getMessage("unavailableError");
    else resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${result?.status} ${result?.statusText}]`;

    log.error(logDir, "sendRequest()", result);
    return resultData;
  }

  resultData.sourceLanguage = result.data.src;
  resultData.percentage = result.data.ld_result.srclangs_confidences[0];
  resultData.resultText = result.data.sentences.map(sentence => sentence.trans).join("");
  if (result.data.dict) {
    resultData.candidateText = result.data.dict
      .map(dict => `${dict.pos}${dict.pos != "" ? ": " : ""}${dict.terms.join(", ")}\n`)
      .join("");
  }

  log.log(logDir, "sendRequest()", resultData);
  return resultData;
};

const sendRequestToDeepL = async (word, sourceLang, targetLang) => {
  log.log(logDir, "sendRequestToDeepL()");

  let params = new URLSearchParams();

  const key = "f5a2c02c-7871-af5c-0d6a-244a9e6d4a1f:fx";
  params.append("auth_key", key);
  params.append("text", word);
  params.append("target_lang", "ja");

  const url = "https://api-free.deepl.com/v2/translate";

  const res = await axios.post(url, params).catch(e => e.response);
  console.log("!!!!!!!!!!!!!!!", res);
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
  setHistory(sourceWord, sourceLang, targetLang, result);
  return result;
};
