import React from "react";
import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import queryString from "query-string";
import OptionsContainer from "./OptionContainer";
import {
  paypalLink,
  patreonLink,
  email,
  chromeExtensionUrl,
  firefoxAddonUrl
} from "src/common/personalUrls";
import manifest from "src/manifest-chrome.json";

export default props => {
  const query = queryString.parse(props.location.search);
  const extensionVersion = manifest.version;

  return (
    <div>
      <p className="contentTitle">{browser.i18n.getMessage("informationLabel")}</p>
      <hr />
      <OptionsContainer
        title={"extName"}
        captions={[]}
        type={"none"}
        updated={query.action === "updated"}
        extraCaption={
          <p className="caption">
            <a href="https://github.com/sienori/simple-translate/releases" target="_blank">
              Version {extensionVersion}
            </a>
            <span>　</span>
            <a
              href="https://github.com/sienori/simple-translate/blob/master/BACKERS.md"
              target="_blank"
            >
              {browser.i18n.getMessage("backersLabel")}
            </a>
          </p>
        }
      />

      <OptionsContainer
        title={"licenseLabel"}
        captions={["Mozilla Public License, Version. 2.0"]}
        useRawCaptions={true}
        type={"none"}
      />
      <hr />
      <OptionsContainer title={"donationLabel"} captions={["donationCaptionLabel"]} type={"none"} />
      <OptionsContainer
        title={""}
        captions={[]}
        type={"none"}
        extraCaption={
          <a href={patreonLink} target="_blank">
            <img
              src="https://c5.patreon.com/external/logo/become_a_patron_button.png"
              alt="Donate"
            />
          </a>
        }
      />
      <OptionsContainer
        title={""}
        captions={[]}
        type={"none"}
        extraCaption={
          <a href={paypalLink} target="_blank">
            <img
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-medium.png"
              alt="Donate"
            />
          </a>
        }
      />
      <OptionsContainer
        title={""}
        captions={[]}
        type={"none"}
        extraCaption={
          <div>
            <p className="caption">
              <a className="amazonUrl" href={browser.i18n.getMessage("amazonUrl")} target="_blank">
                {browser.i18n.getMessage("amazonTitleLabel")}
              </a>
            </p>
            <p className="caption">email: {email}</p>
          </div>
        }
      />
      <hr />
      <OptionsContainer
        title={""}
        captions={[]}
        type={"none"}
        extraCaption={
          <div>
            <p>
              {browserInfo().name === "Chrome" ? (
                <a href={chromeExtensionUrl} target="_blank">
                  {browser.i18n.getMessage("extensionPageLabel")}
                </a>
              ) : (
                <a href={firefoxAddonUrl} target="_blank">
                  {browser.i18n.getMessage("addonPageLabel")}
                </a>
              )}
              <span>　</span>
              <a href="https://github.com/sienori/simple-translate" target="_blank">
                GitHub
              </a>
            </p>
          </div>
        }
      />
    </div>
  );
};
