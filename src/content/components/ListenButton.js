import React from "react";
import SpeakerIcon from "../icons/speaker.svg";

const synth = window.speechSynthesis;

const voices = window.speechSynthesis.getVoices();
let voice = undefined;
for (let i = 0; i < voices.length; i++) {
	if (voices[i].name === "English (Received Pronunciation)+Mr_Serious") {
		voice = voices[i];
		break;
	}
}

const playAudio = (text, lang) => {
	const utterThis = new SpeechSynthesisUtterance(text);
	utterThis.voice = voice;
	utterThis.pitch = 1;
	utterThis.rate = 1;
	synth.speak(utterThis);
};

export default (props) => {
	const { text, lang } = props;

	return (
		<button
			style={{ color: "white" }}
			className='listenButton'
			onClick={() => playAudio(text, lang)}
		>
			<SpeakerIcon />
		</button>
	);
};
