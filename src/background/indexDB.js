const DB_NAME = "simle-translate";
const OBJ_STORE_NAME = "translate-history";

// Open and create the database structure if it doesn't exist
let openRequest = indexedDB.open(DB_NAME, 1);
let db = undefined; // Global variable to hold the IndexedDB database instance

openRequest.onupgradeneeded = function (event) {
	// triggers if the client had no database
	// ...perform initialization...
	db = openRequest.result;

	if (!db.objectStoreNames.contains(OBJ_STORE_NAME)) {
		db.createObjectStore(OBJ_STORE_NAME, { keyPath: "selectedText" });
		console.log("successfully created object store ", OBJ_STORE_NAME);
	}

	// https://javascript.info/indexeddb
};

openRequest.onerror = function () {
	console.error("Error", openRequest.error);
};

openRequest.onsuccess = function () {
	// hold the database object when successfully opened
	db = openRequest.result;
};

export const storeMessage = ({ data, objStoreName = OBJ_STORE_NAME }) => {
	console.log("storeMessage is called with", data);
	let transaction = db.transaction(objStoreName, "readwrite");
	let objectStore = transaction.objectStore(objStoreName);

	const objRequest = objectStore.get(data.selectedText);
	objRequest.onsuccess = function (event) {
		let request = undefined;

		const obj = event.target.result;
		if (obj) {
			// object already exists
			console.log("object already exists", obj);
			obj.count = obj.count + 1;
			request = objectStore.put(obj);
			console.log(obj.selectedText, " is counted ", obj.count, " times");
		} else {
			// object doesn't exist
			console.log("object doesn't exist");
			data = {
				selectedText: data.selectedText.trim().replace(/[\r\n]/gm, "<br>"),
				translatedText: data.translatedText.trim().replace(/[\r\n]/gm, "<br>"),
				candidateText: data.candidateText.trim().replace(/[\r\n]/gm, "<br>"),
				count: 0,
			};
			request = objectStore.add(data);
		}

		request.onsuccess = function (event) {
			console.log("successfully added to ", objStoreName);
		};

		request.onerror = function (event) {
			console.error("error adding to ", objStoreName);
		};

		transaction.oncomplete = function (event) {
			console.log("add transaction complete");
		};
	};
};

export const fetchMessagesAndDownload = () => {
	const transaction = db.transaction(OBJ_STORE_NAME, "readonly");
	const objectStore = transaction.objectStore(OBJ_STORE_NAME);

	const request = objectStore.getAll();

	request.onsuccess = (event) => {
		console.log("successfully fetched messages from IndexedDB");
		const records = event.target.result;
		const delimeter = "|";
		const csvHeader = `selectedText${delimeter}translatedText${delimeter}candidateText${delimeter}count\n`;
		const csv =
			csvHeader +
			records
				.map((record) => {
					return `${record.selectedText}${delimeter}${record.translatedText}${delimeter}${record.candidateText}${delimeter}${record.count}\n`;
				})
				.join("");
		download(csv);
	};

	request.onerror = (event) => {
		console.error("Error fetching records from IndexedDB:", event.target.error);
	};
};

function download(csv) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "translate_history.csv";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
