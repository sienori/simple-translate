import browser from "webextension-polyfill";
import log from "loglevel";
import { getSettings } from "src/settings/settings";
import {
  DeepLTranslateResponse,
  emptyTranslateResult,
  FetchResult,
  GoogleTranslatePaResponse,
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

const GOOGLE_TRANSLATE_PA_KEY = "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA";

const sendRequestToGoogle = async (
  word: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslateResult> => {
  const params = new URLSearchParams();
  params.append("params.client", "gtx");
  params.append("query.source_language", sourceLang);
  params.append("query.target_language", targetLang);
  params.append("query.display_language", targetLang);
  params.append("query.text", word);
  params.append("key", GOOGLE_TRANSLATE_PA_KEY);
  params.append("data_types", "TRANSLATION");
  params.append("data_types", "SENTENCE_SPLITS");
  params.append("data_types", "BILINGUAL_DICTIONARY_FULL");

  const url = `https://translate-pa.googleapis.com/v1/translate?${params.toString()}`;
  const response = await fetch(url).catch(e => ({ status: 0, statusText: "" }));

  const resultData = emptyTranslateResult();

  if (response.status !== 200) {
    resultData.isError = true;

    if (response.status === 0) resultData.errorMessage = browser.i18n.getMessage("networkError");
    else if (response.status === 429 || response.status === 503)
      resultData.errorMessage = browser.i18n.getMessage("unavailableError");
    else
      resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${response.status} ${response.statusText}]`;

    log.error(logDir, "sendRequestToGoogle()", response);
    return resultData;
  }

  const result = (await (response as Response).json()) as GoogleTranslatePaResponse;

  resultData.sourceLanguage = result.sourceLanguage;
  resultData.percentage = result.detectedLanguages.srclangsConfidences[0] ?? 0;
  resultData.resultText = result.translation;
  if (result.bilingualDictionary) {
    resultData.candidateText = result.bilingualDictionary
      .map(
        dict =>
          `${dict.pos}${dict.pos !== "" ? ": " : ""}${dict.entry.map(entry => entry.word).join(", ")}\n`
      )
      .join("");
  }

  log.log(logDir, "sendRequestToGoogle()", resultData);
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
