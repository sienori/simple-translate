import browser from "webextension-polyfill";
import { initSettings } from "src/settings/settings";
import translate from "src/common/translate";

export default async data => {
    await initSettings();
    switch (data.message) {
        case "translate": {
            return await translate(data.text, data.sourceLang, data.targetLang);
        }
    }
}
