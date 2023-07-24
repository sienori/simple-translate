import React from "react";
import browser from "webextension-polyfill";

export const ExportButton = () => {
	const handleExport = () => {
		const message = { type: "export_history" };
		browser.runtime.sendMessage(message);
	};

	return (
		<div>
			<button onClick={handleExport}>Export</button>
		</div>
	);
};
