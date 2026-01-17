import browser from "webextension-polyfill";
import log from "loglevel";
import { getSettings } from "src/settings/settings";

const logDir = "common/translate";

const getHistory = async (sourceWord, sourceLang, targetLang, translationApi) => {
  const result = await browser.storage.session.get(`${sourceLang}-${targetLang}-${translationApi}-${sourceWord}`);
  return result[`${sourceLang}-${targetLang}-${translationApi}-${sourceWord}`] ?? false;
};

const setHistory = async (sourceWord, sourceLang, targetLang, translationApi, result) => {
  if (result.isError) return;
  await browser.storage.session.set({ [`${sourceLang}-${targetLang}-${translationApi}-${sourceWord}`]: result });
};

const sendRequestToGoogle = async (word, sourceLang, targetLang) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
    word
  )}`;
  const response = await fetch(url).catch(e => ({ status: 0, statusText: '' }));

  const resultData = {
    resultText: "",
    candidateText: "",
    sourceLanguage: "",
    percentage: 0,
    isError: false,
    errorMessage: ""
  };

  if (response.status !== 200) {
    resultData.isError = true;

    if (response.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (response.status === 429 || response.status === 503) resultData.errorMessage = browser.i18n.getMessage("unavailableError");
    else resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;

    log.error(logDir, "sendRequest()", response);
    return resultData;
  }

  const result = await response.json();

  resultData.sourceLanguage = result.src;
  resultData.percentage = result.ld_result.srclangs_confidences[0];
  resultData.resultText = result.sentences.map(sentence => sentence.trans).join("");
  if (result.dict) {
    resultData.candidateText = result.dict
      .map(dict => `${dict.pos}${dict.pos != "" ? ": " : ""}${dict.terms !== undefined?dict.terms.join(", "):""}\n`)
      .join("");
  }

  log.log(logDir, "sendRequest()", resultData);
  return resultData;
};

const sendRequestToDeepL = async (word, sourceLang, targetLang) => {
  let params = new URLSearchParams();
  const authKey = getSettings("deeplAuthKey");
  params.append("auth_key", authKey);
  params.append("text", word);
  params.append("target_lang", targetLang);
  const url = getSettings("deeplPlan") === "deeplFree" ?
    "https://api-free.deepl.com/v2/translate" :
    "https://api.deepl.com/v2/translate";

  const response = await fetch(url, {
    method: "POST",
    body: params
  }).catch(e => ({ status: 0, statusText: '' }));

  const resultData = {
    resultText: "",
    candidateText: "",
    sourceLanguage: "",
    percentage: 0,
    isError: false,
    errorMessage: ""
  };

  if (response.status !== 200) {
    resultData.isError = true;

    if (response.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (response.status === 403) resultData.errorMessage = browser.i18n.getMessage("deeplAuthError");
    else resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;

    log.error(logDir, "sendRequestToDeepL()", response);
    return resultData;
  }

  const result = await response.json();

  resultData.resultText = result.translations[0].text;
  resultData.sourceLanguage = result.translations[0].detected_source_language.toLowerCase();
  resultData.percentage = 1;

  log.log(logDir, "sendRequestToDeepL()", resultData);
  return resultData;
};

const sendRequestToOpenAI = async (word, sourceLang, targetLang) => {
  const apiKey = getSettings("openaiApiKey");
  const model = getSettings("openaiModel");
  const url = "https://api.openai.com/v1/chat/completions";
  
  const targetLangName = browser.i18n.getMessage("lang_" + targetLang.replace("-", "_"));
  
  const prompt = `Translate the following text to ${targetLangName}:\n\n${word}`;
  
  const requestBody = {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are a translator. Translate the text exactly as provided without adding any explanations or additional content."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  }).catch(e => ({ status: 0, statusText: '' }));

  const resultData = {
    resultText: "",
    candidateText: "",
    sourceLanguage: sourceLang === "auto" ? "auto" : sourceLang,
    percentage: 1,
    isError: false,
    errorMessage: ""
  };

  if (response.status !== 200) {
    resultData.isError = true;

    if (response.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (response.status === 401) resultData.errorMessage = browser.i18n.getMessage("openaiAuthError");
    else if (response.status === 429) resultData.errorMessage = browser.i18n.getMessage("unavailableError");
    else resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;

    log.error(logDir, "sendRequestToOpenAI()", response);
    return resultData;
  }

  const result = await response.json();
  
  if (result.choices && result.choices.length > 0) {
    resultData.resultText = result.choices[0].message.content.trim();
  } else {
    resultData.isError = true;
    resultData.errorMessage = browser.i18n.getMessage("unknownError");
    log.error(logDir, "sendRequestToOpenAI() - No translation result", result);
  }

  log.log(logDir, "sendRequestToOpenAI()", resultData);
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

  const translationApi = getSettings("translationApi");

  const cachedResult = await getHistory(sourceWord, sourceLang, targetLang, translationApi);
  if (cachedResult) return cachedResult;

  let result;
  if (translationApi === "google") {
    result = await sendRequestToGoogle(sourceWord, sourceLang, targetLang);
  } else if (translationApi === "deepl") {
    result = await sendRequestToDeepL(sourceWord, sourceLang, targetLang);
  } else if (translationApi === "openai") {
    result = await sendRequestToOpenAI(sourceWord, sourceLang, targetLang);
  }
  
  setHistory(sourceWord, sourceLang, targetLang, translationApi, result);
  return result;
};
