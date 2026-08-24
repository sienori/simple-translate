import browser from "webextension-polyfill";
import log from "loglevel";
import { getSettings } from "src/settings/settings";
import {
  DeepLTranslateResponse,
  emptyTranslateResult,
  FetchResult,
  GoogleTranslateLegacyResponse,
  TranslateResult
} from "./translateTypes";

const logDir = "common/translate";

const getHistory = async (
  sourceWord: string,
  sourceLang: string,
  targetLang: string,
  translationApi: string
): Promise<TranslateResult | false> => {
  const key = `${sourceLang}-${targetLang}-${translationApi}-${sourceWord}`;
  const result = await browser.storage.session.get(key);
  return (result[key] as TranslateResult | undefined) ?? false;
};

const setHistory = async (
  sourceWord: string,
  sourceLang: string,
  targetLang: string,
  translationApi: string,
  result: TranslateResult
): Promise<void> => {
  if (result.isError) return;
  await browser.storage.session.set({
    [`${sourceLang}-${targetLang}-${translationApi}-${sourceWord}`]: result
  });
};

const sendRequestToGoogle = async (
  word: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslateResult> => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
    word
  )}`;
  const response: FetchResult = await fetch(url).catch(() => ({ status: 0, statusText: "" }));

  const resultData = emptyTranslateResult();

  if (response.status !== 200) {
    resultData.isError = true;

    if (response.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (response.status === 429 || response.status === 503)
      resultData.errorMessage = browser.i18n.getMessage("unavailableError");
    else
      resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;

    log.error(logDir, "sendRequest()", response);
    return resultData;
  }

  const result = (await (response as Response).json()) as GoogleTranslateLegacyResponse;

  resultData.sourceLanguage = result.src;
  resultData.percentage = result.ld_result.srclangs_confidences[0];
  resultData.resultText = result.sentences.map(sentence => sentence.trans).join("");
  if (result.dict) {
    resultData.candidateText = result.dict
      .map(
        dict =>
          `${dict.pos}${dict.pos !== "" ? ": " : ""}${dict.terms !== undefined ? dict.terms.join(", ") : ""}\n`
      )
      .join("");
  }

  log.log(logDir, "sendRequest()", resultData);
  return resultData;
};

const sendRequestToDeepL = async (
  word: string,
  _sourceLang: string,
  targetLang: string
): Promise<TranslateResult> => {
  const headers = new Headers();
  const params = new URLSearchParams();
  const authKey = getSettings("deeplAuthKey") as string;
  headers.append("Authorization", `DeepL-Auth-Key ${authKey}`);
  params.append("text", word);
  params.append("target_lang", targetLang);
  const url =
    getSettings("deeplPlan") === "deeplFree"
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";

  const response: FetchResult = await fetch(url, {
    method: "POST",
    headers: headers,
    body: params
  }).catch(() => ({ status: 0, statusText: "" }));

  const resultData = emptyTranslateResult();

  if (response.status !== 200) {
    resultData.isError = true;

    if (response.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (response.status === 403)
      resultData.errorMessage = browser.i18n.getMessage("deeplAuthError");
    else
      resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;

    log.error(logDir, "sendRequestToDeepL()", response);
    return resultData;
  }

  const result = (await (response as Response).json()) as DeepLTranslateResponse;

  resultData.resultText = result.translations[0].text;
  resultData.sourceLanguage = result.translations[0].detected_source_language.toLowerCase();
  resultData.percentage = 1;

  log.log(logDir, "sendRequestToDeepL()", resultData);
  return resultData;
};

export default async (
  sourceWord: string,
  sourceLang = "auto",
  targetLang: string
): Promise<TranslateResult> => {
  log.log(logDir, "tranlate()", sourceWord, targetLang);
  sourceWord = sourceWord.trim();
  if (sourceWord === "")
    return {
      resultText: "",
      candidateText: "",
      sourceLanguage: "en",
      percentage: 0,
      statusText: "OK",
      isError: false,
      errorMessage: ""
    };

  const translationApi = getSettings("translationApi") as string;

  const cachedResult = await getHistory(sourceWord, sourceLang, targetLang, translationApi);
  if (cachedResult) return cachedResult;

  const result =
    translationApi === "google"
      ? await sendRequestToGoogle(sourceWord, sourceLang, targetLang)
      : await sendRequestToDeepL(sourceWord, sourceLang, targetLang);
  setHistory(sourceWord, sourceLang, targetLang, translationApi, result);
  return result;
};
