import React from "react";
import browser from "webextension-polyfill";
import SpeakerIcon from "../icons/speaker.svg";
import "../styles/ListenButton.scss";

const playAudio = async (text, lang) => {
	const message = { type: "play_audio", text, lang };
	browser.runtime.sendMessage(message);
};

export default ({ text, lang }) => {
	const canListen = text && text.length < 200;
	if (!canListen) return null;

	return (
		<button
			className='listenButton'
			onClick={() => playAudio(text, "en")}
			title={browser.i18n.getMessage("listenLabel")}
		>
			<SpeakerIcon />
		</button>
	);
};
