import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import log from "loglevel";
import { initSettings, handleSettingsChange } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import onInstalledListener from "./onInstalledListener";
import {
	showMenus,
	onMenusShownListener,
	onMenusClickedListener,
} from "./menus";
import { onCommandListener } from "./keyboardShortcuts";
import { storeMessage, fetchMessagesAndDownload } from "./indexDB";

const logDir = "background/background";

const addListeners = () => {
	browser.storage.onChanged.addListener((changes, areaName) => {
		handleSettingsChange(changes, areaName);
		updateLogLevel();
		showMenus();
	});
	const isValidMenusOnShown =
		browserInfo().name === "Firefox" && browserInfo().version >= 60;
	if (isValidMenusOnShown)
		browser.contextMenus.onShown.addListener(onMenusShownListener);
	browser.contextMenus.onClicked.addListener(onMenusClickedListener);
};

const init = async () => {
	await initSettings();
	overWriteLogLevel();
	updateLogLevel();
	log.info(logDir, "init()");
	addListeners();
	showMenus();
};
init();

const playAudio = async (text, lang) => {
	const url = `https://translate.google.com/translate_tts?client=tw-ob&q=${encodeURIComponent(
		text
	)}&tl=${lang}`;
	const audio = new Audio(url);
	audio.crossOrigin = "anonymous";
	audio.load();
	await audio.play().catch((e) => log.error(logDir, "playAudio()", e, url));
};

browser.runtime.onInstalled.addListener(onInstalledListener);

browser.commands.onCommand.addListener(onCommandListener);

browser.runtime.onMessage.addListener((message) => {
	if (message.type === "export_history") {
		fetchMessagesAndDownload();
		return;
	}

	if (message.type === "translate") {
		storeMessage({ data: message });
		return;
	}

	if (message.type === "play_audio") {
		playAudio(message.text, message.lang);
	}
});
