import log from "loglevel";
import { getSettings } from "src/settings/settings";

let isInited = false;
export const overWriteLogLevel = () => {
  if (isInited) return;
  isInited = true;

  const originalFactory = log.methodFactory;
  log.methodFactory = (methodName, logLevel, loggerName) => {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return (logDir, ...args) => {
      rawMethod(`[${methodName}]`, `${logDir}:`, ...args);
    };
  };
};

export const updateLogLevel = () => {
  const isDebugMode = getSettings("isDebugMode");
  if (isDebugMode) log.enableAll(false);
  else log.disableAll(false);
};
