let translationHistory = [];

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
};

export default async (sourceWord, sourceLang = "auto", targetLang) => {
  sourceWord = sourceWord.trim();
  const history = getHistory(sourceWord, sourceLang, targetLang);
  if (history) return history.result;

  const result = await sendRequest(sourceWord, sourceLang, targetLang);
  const formattedResult = formatResult(result);
  setHistory(sourceWord, sourceLang, targetLang, formattedResult);
  return formattedResult;
};
