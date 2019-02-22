import browser from "webextension-polyfill";

export default statusText => {
  let errorMessage = "";
  switch (statusText) {
    case "Network Error":
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
