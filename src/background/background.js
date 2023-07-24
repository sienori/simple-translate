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

browser.runtime.onInstalled.addListener(onInstalledListener);
browser.commands.onCommand.addListener(onCommandListener);

browser.runtime.onMessage.addListener((message) => {
	if (message.type === "export_history") {
		fetchMessagesAndDownload();
		return;
	}

	if (message.type === "translate") {
		console.log("on tranlate message");
		storeMessage(message);
		return;
	}
});

let db; // Global variable to hold the IndexedDB database instance

// Open the database and create an object store
const request = indexedDB.open("message_database", 1);

// Event handler for successful database creation or version upgrade
request.onupgradeneeded = (event) => {
	db = event.target.result;
	// Create an object store named 'messages'
	if (!db.objectStoreNames.contains("messages")) {
		db.createObjectStore("messages", { keyPath: "hashCode" });
	}
};

// Event handler for successful database opening
request.onsuccess = (event) => {
	db = event.target.result;
	console.log("successful database opening");
};

// Event handler for database errors
request.onerror = (event) => {
	console.error("IndexedDB error:", event.target.error);
};

function hashCode() {
	let chr,
		hash = 0;
	if (this.length === 0) return hash;
	for (let i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

function storeMessage(message) {
	const { selectedText } = message; // Extract the selectedText from the message object
	message.hashCode = hashCode.call(selectedText); // Add a hashCode property to the message object
	// Check if the selectedText already exists in the database
	const getRequest = db
		.transaction(["messages"])
		.objectStore("messages")
		.get(message.hashCode);

	getRequest.onsuccess = (event) => {
		const existingMessage = event.target.result;

		// If the selectedText does not exist in the database, add the new message
		if (!existingMessage) {
			const transaction = db.transaction(["messages"], "readwrite");
			const objectStore = transaction.objectStore("messages");

			const request = objectStore.add(message);

			request.onsuccess = (event) => {
				console.log("Message successfully stored in IndexedDB");
			};

			request.onerror = (event) => {
				console.error("Error storing message in IndexedDB:", event.target.error);
			};
		} else {
			// If the selectedText already exists, you can choose to update or ignore the new message
			// For simplicity, let's just log a message indicating that the selectedText already exists.
			console.log(
				`Message with selectedText "${selectedText}" already exists. Ignoring new message.`
			);
		}
	};

	getRequest.onerror = (event) => {
		console.error(
			"Error checking existing message in IndexedDB:",
			event.target.error
		);
	};
}

function fetchMessagesAndDownload() {
	const transaction = db.transaction(["messages"], "readonly");
	const objectStore = transaction.objectStore("messages");

	const request = objectStore.getAll();

	request.onsuccess = (event) => {
		const messages = event.target.result;
		console.log("successfully fetched messages from IndexedDB");
		downloadMessagesAsJSON(messages);
	};

	request.onerror = (event) => {
		console.error("Error fetching messages from IndexedDB:", event.target.error);
	};
}

function downloadMessagesAsJSON(messages) {
	const json = JSON.stringify(messages, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "messages.json";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
