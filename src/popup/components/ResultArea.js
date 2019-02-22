import React from "react";
import browser from "webextension-polyfill";
import "../styles/ResultArea.scss";

const getErrorMessage = statusText => {
  let errorMessage = "";
  switch (statusText) {
    case "":
      errorMessage = browser.i18n.getMessage("networkError");
      break;
    case "Service Unavailable":
      errorMessage = browser.i18n.getMessage("unavailableError");
      break;
    default:
      errorMessage = `${browser.i18n.getMessage("unknownError")} [${statusText}]`;
      break;
  }
  return errorMessage;
};

const splitLine = text => {
  const regex = /(\n)/g;
  return text.split(regex).map((line, i) => (line.match(regex) ? <br key={i} /> : line));
};

export default props => {
  const { resultText, candidateText, statusText } = props;
  const isError = statusText !== "OK";

  return (
    <div id="resultArea">
      <p className="resultText">{splitLine(resultText)}</p>
      <p className="candidateText">
        {isError ? getErrorMessage(statusText) : splitLine(candidateText)}
      </p>
    </div>
  );
};
