import browser from "webextension-polyfill";
import log from "loglevel";
import axios from "axios";
import { getSettings } from "src/settings/settings";

let translationHistory = [];

const logDir = "common/translate";

console.log("translate js running on background");

const getHistory = (sourceWord, sourceLang, targetLang, translationApi) => {
	const history = translationHistory.find(
		(history) =>
			history.sourceWord == sourceWord &&
			history.sourceLang == sourceLang &&
			history.targetLang == targetLang &&
			history.translationApi == translationApi &&
			!history.result.isError
	);
	return history;
};

const setHistory = (
	sourceWord,
	sourceLang,
	targetLang,
	translationApi,
	result
) => {
	translationHistory.push({
		sourceWord: sourceWord,
		sourceLang: sourceLang,
		targetLang: targetLang,
		translationApi: translationApi,
		result: result,
	});
};

const sendRequestToGoogle = async (word, sourceLang, targetLang) => {
	const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=bd&dj=1&q=${encodeURIComponent(
		word
	)}`;
	const result = await axios.get(url).catch((error) => error.response);

	const resultData = {
		resultText: "",
		candidateText: "",
		sourceLanguage: "",
		percentage: 0,
		isError: false,
		errorMessage: "",
	};

	if (!result || result?.status !== 200) {
		resultData.isError = true;

		if (!result || result.status === 0)
			resultData.errorMessage = browser.i18n.getMessage("networkError");
		else if (result.status === 429 || result.status === 503)
			resultData.errorMessage = browser.i18n.getMessage("unavailableError");
		else
			resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${
				result?.status
			} ${result?.statusText}]`;

		log.error(logDir, "sendRequest()", result);
		return resultData;
	}

	resultData.sourceLanguage = result.data.src;
	resultData.percentage = result.data.ld_result.srclangs_confidences[0];
	resultData.resultText = result.data.sentences
		.map((sentence) => sentence.trans)
		.join("");
	if (result.data.dict) {
		resultData.candidateText = result.data.dict
			.map(
				(dict) =>
					`${dict.pos}${dict.pos != "" ? ": " : ""}${dict.terms.join(", ")}\n`
			)
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
	const url =
		getSettings("deeplPlan") === "deeplFree"
			? "https://api-free.deepl.com/v2/translate"
			: "https://api.deepl.com/v2/translate";
	const result = await axios.post(url, params).catch((e) => e.response);

	const resultData = {
		resultText: "",
		candidateText: "",
		sourceLanguage: "",
		percentage: 0,
		isError: false,
		errorMessage: "",
	};

	if (!result || result?.status !== 200) {
		resultData.isError = true;

		if (!result || result.status === 0)
			resultData.errorMessage = browser.i18n.getMessage("networkError");
		else if (result.status === 403)
			resultData.errorMessage = browser.i18n.getMessage("deeplAuthError");
		else
			resultData.errorMessage = `${browser.i18n.getMessage("unknownError")} [${
				result?.status
			} ${result?.statusText}] ${result?.data.message}`;

		log.error(logDir, "sendRequestToDeepL()", result);
		return resultData;
	}

	resultData.resultText = result.data.translations[0].text;
	resultData.sourceLanguage =
		result.data.translations[0].detected_source_language.toLowerCase();
	resultData.percentage = 1;

	log.log(logDir, "sendRequestToDeepL()", resultData);
	return resultData;
};

export default async (
	sourceWord,
	sourceLang = "auto",
	targetLang,
	translationApi
) => {
	log.log(logDir, "tranlate()", sourceWord, targetLang, translationApi);
	sourceWord = sourceWord.trim();
	if (sourceWord === "")
		return {
			resultText: "",
			candidateText: "",
			sourceLanguage: "en",
			percentage: 0,
			statusText: "OK",
		};

	const history = getHistory(sourceWord, sourceLang, targetLang);
	if (history) return history.result;

	const result =
		getSettings("translationApi") === "google"
			? await sendRequestToGoogle(sourceWord, sourceLang, targetLang)
			: await sendRequestToDeepL(sourceWord, sourceLang, targetLang);
	setHistory(sourceWord, sourceLang, targetLang, translationApi, result);

	return result;
};
