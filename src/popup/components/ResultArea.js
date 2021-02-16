import React from "react";
import browser from "webextension-polyfill";
import getErrorMessage from "src/common/getErrorMessage";
import { getSettings } from "src/settings/settings";
import openUrl from "src/common/openUrl";
import CopyButton from "./CopyButton";
import ListenButton from "./ListenButton";
import "../styles/ResultArea.scss";

const splitLine = text => {
  const regex = /(\n)/g;
  return text.split(regex).map((line, i) => (line.match(regex) ? <br key={i} /> : line));
};

export default props => {
  const { resultText, candidateText, statusText, targetLang } = props;
  const isError = statusText !== "OK";
  const shouldShowCandidate = getSettings("ifShowCandidate");

  const handleLinkClick = () => {
    const { inputText, targetLang } = props;
    const encodedText = encodeURIComponent(inputText);
    const translateUrl = `https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodedText}`;
    openUrl(translateUrl);
  };

  return (
    <div id="resultArea">
      <p className="resultText" dir="auto">{splitLine(resultText)}</p>
      {shouldShowCandidate && <p className="candidateText" dir="auto">{splitLine(candidateText)}</p>}
      {isError && <p className="error">{getErrorMessage(statusText)}</p>}
      {isError && (
        <p className="translateLink">
          <a onClick={handleLinkClick}>{browser.i18n.getMessage("openInGoogleLabel")}</a>
        </p>
      )}
      <div className="mediaButtons">
        <CopyButton text={resultText} />
        <ListenButton text={resultText} lang={targetLang} />
      </div>
    </div>
  );
};
