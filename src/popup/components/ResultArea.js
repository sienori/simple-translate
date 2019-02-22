import React from "react";
import getErrorMessage from "src/common/getErrorMessage";
import "../styles/ResultArea.scss";

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
