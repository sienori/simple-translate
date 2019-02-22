import React from "react";
import getErrorMessage from "src/common/getErrorMessage";
import { getSettings } from "src/settings/settings";
import "../styles/ResultArea.scss";

const splitLine = text => {
  const regex = /(\n)/g;
  return text.split(regex).map((line, i) => (line.match(regex) ? <br key={i} /> : line));
};

export default props => {
  const { resultText, candidateText, statusText } = props;
  const isError = statusText !== "OK";
  const shouldShowCandidate = getSettings("ifShowCandidate");

  return (
    <div id="resultArea">
      <p className="resultText">{splitLine(resultText)}</p>
      {shouldShowCandidate && <p className="candidateText">{splitLine(candidateText)}</p>}
      {isError && <p className="error">{getErrorMessage(statusText)}</p>}
    </div>
  );
};
