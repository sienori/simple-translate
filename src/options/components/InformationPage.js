import React, { useState, useEffect } from "react";
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

  const [sponsorsHeihgt, setSponsorsHeight] = useState();

  useEffect(() => {
    const setHeight = e => {
      if (e.data[0] !== "setSponsorsHeight") return;
      setSponsorsHeight(e.data[1]);
    };
    window.addEventListener("message", setHeight);
    return () => window.removeEventListener("message", setHeight);
  });

  const [hasPermission, requestPermission] = useAdditionalPermission();

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

      {!hasPermission &&
        <>
          <hr />
          <OptionsContainer
            title={"additionalPermissionLabel"}
            captions={["additionalPermissionCaptionLabel"]}
            type={"button"}
            value={"enableLabel"}
            onClick={requestPermission}
          />
        </>
      }

      <hr />
      <OptionsContainer title={"donationLabel"} captions={["donationCaptionLabel"]} type={"none"} />
      <OptionsContainer
        title={""}
        captions={[""]}
        type={"none"}
        extraCaption={
          <div>
            <a href={patreonLink} target="_blank">
              <img src="/icons/patreonButton.png" alt="Patreon"
                style={{ height: 44, marginInlineEnd: 20 }} />
            </a>
            <a href={paypalLink} target="_blank">
              <img src="/icons/paypalButton.png" alt="Paypal" />
            </a>
          </div>
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
        title={"sponsorsLabel"}
        captions={[""]}
        type={"none"}
        extraCaption={
          <iframe src="https://simple-translate.sienori.com/sponsors.html"
            style={{ height: sponsorsHeihgt, marginTop: 10 }} />
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
              <span>　</span>
              <a href="https://simple-translate.sienori.com/privacy-policy" target="_blank">
                {browser.i18n.getMessage("privacyPolicyLabel")}
              </a>
            </p>
          </div>
        }
      />
    </div>
  );
};

const useAdditionalPermission = () => {
  const [hasPermission, setHasPermission] = useState(true);

  const permissions = {
    origins: [
      "http://*/*",
      "https://*/*",
      "<all_urls>"
    ]
  };

  const checkPermission = async () => {
    const hasPermission = await browser.permissions.contains(permissions);
    setHasPermission(hasPermission);
  }

  const requestPermission = async () => {
    await browser.permissions.request(permissions);
    checkPermission();
  }

  useEffect(() => {
    checkPermission();
  }, []);

  return [hasPermission, requestPermission];
}
