import browser from "webextension-polyfill";
const alphabeticallySort = (a, b) => a.name.localeCompare(b.name);

const langListGoogle = ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh-CN", "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jv", "kn", "kk", "km", "rw", "ko", "ku", "ky", "lo", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "ny", "or", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "tt", "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"];
const langListDeepl = ["bg", "cs", "da", "de", "el", "en-GB", "en-US", "es", "et", "fi", "fr", "hu", "id", "it", "ja", "ko", "lt", "lv", "nb", "nl", "pl", "pt-PT", "pt-BR", "ro", "ru", "sk", "sl", "sv", "tr", "uk", "zh"];

export default (translationApi) => {
  const langList = translationApi === "google" ? langListGoogle : langListDeepl;
  const langOptions = langList.map(lang => ({
    value: lang,
    name: browser.i18n.getMessage("lang_" + lang.replace("-", "_"))
  }));
  langOptions.sort(alphabeticallySort);
  return langOptions;
};
