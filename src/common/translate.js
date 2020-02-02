import log from "loglevel";
import { getSettings } from "src/settings/settings";
var AWS = require("aws-sdk");
AWS.config.update({
  credentials: new AWS.Credentials(
    getSettings("accessKeyId"),
    getSettings("secretKey")
  ),
  region: 'ap-northeast-1'
});
let translationHistory = [];
var translater = new AWS.Translate();

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
  let params = {
    SourceLanguageCode: sourceLang, /* required */
    TargetLanguageCode: targetLang, /* required */
    Text: word /* required */
  }
  log.log(logDir, "sendRequest()");
  log.log(logDir, "params:", params);
  var translatePromis;
  try{
    translatePromis = translater.translateText(params).promise();
  }catch(error){
    log.log(logDir, error);
    translatePromis = null;
  }
  return translatePromis;
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
  resultData.percentage = result.response.ld_result.srclangs_confidences[0];
  resultData.resultText = result.response.sentences.map(sentence => sentence.trans).join("");
  if (result.response.dict) {
    resultData.candidateText = result.response.dict
      .map(dict => `${dict.pos}${dict.pos != "" ? ": " : ""}${dict.terms.join(", ")}\n`)
      .join("");
  }

  log.log(logDir, "formatResult()", resultData);
  return resultData;
};

const formatAwsResult = result => {
  const resultData = {
    resultText: "",
    candidateText: "",
    sourceLanguage: "",
    percentage: 0,
    statusText: ""
  };

  // Now I don't understand how to get AWS.Response by using translateText. so I have not check HTTP Status Code yet.
  /*
  if (result.status === 0) resultData.statusText = "Network Error";
  else if (result.status === 200) resultData.statusText = "OK";
  else if (result.status === 429) resultData.statusText = "Service Unavailable";
  else if (result.status === 503) resultData.statusText = "Service Unavailable";
  else resultData.statusText = result.statusText || result.status;
  */

  if (!result) {
    log.error(logDir, "formatResult()", "NullTranslateResult");
    return "Unexpected NullResult Error";
  }
  if (!result.TranslatedText) {
    log.error(logDir, "formatResult()", "UnexpectedError");
    return result;
  }
  resultData.statusText = "OK";

  resultData.sourceLanguage = result.SourceLanguageCode;
  //resultData.percentage = result.response.ld_result.srclangs_confidences[0];
  resultData.resultText = result.TranslatedText;

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
  const formattedResult = formatAwsResult(result);
  setHistory(sourceWord, sourceLang, targetLang, formattedResult);
  return formattedResult;
};
