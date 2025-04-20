import React from "react";

function PromptDisplay({ prompt, response }) {
  if (!prompt) return null;

  let errorIndex = -1;
  for (let i = 0; i < response.length; i++) {
    if (response[i] !== prompt[i]) {
      errorIndex = i;
      break;
    }
  }

  if (errorIndex === -1 && response.length > prompt.length) {
    errorIndex = prompt.length;
  }

  let content;
  if (errorIndex === -1) {
    const completedPart = prompt.substring(0, response.length);
    const remainingPart = prompt.substring(response.length);
    content = (
      <span id="prompt">
        <span style={{ color: "#4CAF50" }}>{completedPart}</span>
        {remainingPart}
      </span>
    );
  } else {
    const correctPart = prompt.substring(0, errorIndex);
    const incorrectPart = response.substring(errorIndex);
    const remainingPart = prompt.substring(errorIndex);
    content = (
      <span id="prompt">
        <span style={{ color: "#4CAF50" }}>{correctPart}</span>
        <span style={{ color: "#FF0000" }}>{incorrectPart}</span>
        {remainingPart}
      </span>
    );
  }

  return <div className="prompt">{content}</div>;
}

export default PromptDisplay;
