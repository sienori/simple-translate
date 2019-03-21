import browserInfo from "browser-info";

const browserName = browserInfo().name;
const suffix = browserName === "Chrome" ? "fc" : "";
export const email = `sienori.firefox+st${suffix}@gmail.com`;
export const paypalLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&no_shipping=1&business=sienori.firefox@gmail.com&item_name=Simple Translate for ${browserName} - Donation`;
export const chromeExtensionUrl = `https://chrome.google.com/webstore/detail/iaiomicjabeggjcfkbimgmglanimpnae/`;
export const firefoxAddonUrl = `https://addons.mozilla.org/firefox/addon/tab-session-manager/`;
