import React from "react";
import browser from "webextension-polyfill";
import getErrorMessage from "src/common/getErrorMessage";
import { getSettings } from "src/settings/settings";
import openUrl from "src/common/openUrl";
import "../styles/ResultArea.scss";
import MediaButtons from "./MediaButtons";

const splitLine = text => {
  const regex = /(\n)/g;
  return text.split(regex).map((line, i) => (line.match(regex) ? <br key={i} /> : line));
};

export default props => {
  const { resultText, candidateText, statusText } = props;
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
      <p className="resultText">{splitLine(resultText)}</p>
      {shouldShowCandidate && <p className="candidateText">{splitLine(candidateText)}</p>}
      {isError && <p className="error">{getErrorMessage(statusText)}</p>}
      {isError && (
        <p className="translateLink">
          <a onClick={handleLinkClick}>{browser.i18n.getMessage("openInGoogleLabel")}</a>
        </p>
      )}
      <MediaButtons resultText={resultText} />
    </div>
  );
};
