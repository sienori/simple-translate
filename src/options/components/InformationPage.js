import React from "react";
import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import queryString from "query-string";
import OptionsContainer from "./OptionContainer";
import { paypalLink, email } from "src/common/personalUrls";
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
          <a href={paypalLink} target="_blank">
            <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" alt="Donate" />
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
              <a
                href={
                  browser.i18n.getMessage("addonUrl")
                  /*browserInfo().name === "Firefox"
                    ? browser.i18n.getMessage("addonUrl")
                    : "https://chrome.google.com/webstore/detail/simple-translate/xxxxx" //TODO: Chrome link*/
                }
                target="_blank"
              >
                {browser.i18n.getMessage("addonPageLabel")}
              </a>
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
