import browser from "webextension-polyfill";
import generateLangOptions from "src/common/generateLangOptions";

const getDefaultLangs = () => {
  const uiLang = browser.i18n.getUILanguage();
  const langOptions = generateLangOptions();

  const shouldUseUiLang = langOptions.some(lang => lang.value == uiLang);
  const targetLang = shouldUseUiLang ? uiLang : "en";
  const secondTargetLang = targetLang === "en" ? "ja" : "en";

  return { targetLang, secondTargetLang };
};

const langListOptions = generateLangOptions();
const defaultLangs = getDefaultLangs();

export default [
  {
    category: "generalLabel",
    elements: [
      {
        id: "targetLang",
        title: "targetLangLabel",
        captions: ["targetLangCaptionLabel"],
        type: "select",
        default: defaultLangs.targetLang,
        options: langListOptions,
        useRawOptionName: true
      },
      {
        id: "ifShowCandidate",
        title: "ifShowCandidateLabel",
        captions: ["ifShowCandidateCaptionLabel"],
        type: "checkbox",
        default: true
      }
    ]
  },
  {
    category: "webPageLabel",
    elements: [
      {
        id: "whenSelectText",
        title: "whenSelectTextLabel",
        captions: [],
        type: "none",
        default: "showButton",
        childElements: [
          {
            id: "whenSelectText",
            title: "ifShowButtonLabel",
            captions: ["ifShowButtonCaptionLabel"],
            type: "radio",
            value: "showButton"
          },
          {
            id: "whenSelectText",
            title: "ifAutoTranslateLabel",
            captions: ["ifAutoTranslateCaptionLabel"],
            type: "radio",
            value: "showPanel"
          },
          {
            id: "whenSelectText",
            title: "dontShowButtonLabel",
            captions: ["dontShowButtonCaptionLabel"],
            type: "radio",
            value: "dontShowButton"
          },
          {
            id: "ifCheckLang",
            title: "ifCheckLangLabel",
            captions: ["ifCheckLangCaptionLabel"],
            type: "checkbox",
            default: true,
            hr: true
          }
        ]
      }
    ]
  },
  {
    category: "toolbarLabel",
    elements: [
      {
        id: "ifChangeSecondLang",
        title: "ifChangeSecondLangLabel",
        captions: ["ifChangeSecondLangCaptionLabel"],
        type: "checkbox",
        default: false,
        childElements: [
          {
            id: "secondTargetLang",
            title: "secondTargetLangLabel",
            captions: ["secondTargetLangCaptionLabel"],
            type: "select",
            default: defaultLangs.secondTargetLang,
            options: langListOptions,
            useRawOptionName: true
          }
        ]
      },
      {
        id: "waitTime",
        title: "waitTimeLabel",
        captions: ["waitTimeCaptionLabel", "waitTime2CaptionLabel"],
        type: "number",
        min: 0,
        placeholder: 500,
        default: 500
      }
    ]
  },
  {
    category: "menuLabel",
    elements: [
      {
        id: "ifShowMenu",
        title: "ifShowMenuLabel",
        captions: ["ifShowMenuCaptionLabel"],
        type: "checkbox",
        default: true
      }
    ]
  },
  {
    category: "styleLabel",
    elements: [
      {
        title: "buttonStyleLabel",
        captions: ["buttonStyleCaptionLabel"],
        type: "none",
        childElements: [
          {
            id: "buttonSize",
            title: "buttonSizeLabel",
            captions: [],
            type: "number",
            min: 1,
            placeholder: 22,
            default: 22
          },
          {
            id: "buttonDirection",
            title: "buttonPositionLabel",
            captions: [],
            type: "select",
            default: "bottomRight",
            options: [
              {
                name: "topLabel",
                value: "top"
              },
              {
                name: "bottomLabel",
                value: "bottom"
              },
              {
                name: "rightLabel",
                value: "right"
              },
              {
                name: "leftLabel",
                value: "left"
              },
              {
                name: "topRightLabel",
                value: "topRight"
              },
              {
                name: "topLeftLabel",
                value: "topLeft"
              },
              {
                name: "bottomRightLabel",
                value: "bottomRight"
              },
              {
                name: "bottomLeftLabel",
                value: "bottomLeft"
              }
            ],
            new: true
          }
        ]
      },
      {
        title: "panelStyleLabel",
        captions: ["panelStyleCaptionLabel"],
        type: "none",
        childElements: [
          {
            id: "width",
            title: "widthLabel",
            captions: [],
            type: "number",
            min: 1,
            placeholder: 300,
            default: 300
          },
          {
            id: "height",
            title: "heightLabel",
            captions: [],
            type: "number",
            min: 1,
            placeholder: 200,
            default: 200
          },
          {
            id: "fontSize",
            title: "fontSizeLabel",
            captions: [],
            type: "number",
            min: 1,
            placeholder: 13,
            default: 13
          },
          {
            id: "panelReferencePoint",
            title: "referencePointLabel",
            captions: [],
            type: "select",
            default: "bottomSelectedText",
            options: [
              {
                name: "topSelectedTextLabel",
                value: "topSelectedText"
              },
              {
                name: "bottomSelectedTextLabel",
                value: "bottomSelectedText"
              },
              {
                name: "clickedPointLabel",
                value: "clickedPoint"
              }
            ],
            new: true
          },
          {
            id: "panelDirection",
            title: "displayDirectionLabel",
            captions: [],
            type: "select",
            default: "bottom",
            options: [
              {
                name: "topLabel",
                value: "top"
              },
              {
                name: "bottomLabel",
                value: "bottom"
              },
              {
                name: "rightLabel",
                value: "right"
              },
              {
                name: "leftLabel",
                value: "left"
              },
              {
                name: "topRightLabel",
                value: "topRight"
              },
              {
                name: "topLeftLabel",
                value: "topLeft"
              },
              {
                name: "bottomRightLabel",
                value: "bottomRight"
              },
              {
                name: "bottomLeftLabel",
                value: "bottomLeft"
              }
            ],
            new: true
          },
          {
            id: "resultFontColor",
            title: "resultFontColorLabel",
            captions: [],
            type: "color",
            default: "#000000",
            new: true
          },
          {
            id: "candidateFontColor",
            title: "candidateFontColorLabel",
            captions: [],
            type: "color",
            default: "#737373",
            new: true
          },
          {
            id: "bgColor",
            title: "bgColorLabel",
            captions: [],
            type: "color",
            default: "#ffffff"
          }
        ]
      }
    ]
  },
  {
    category: "otherLabel",
    elements: [
      {
        id: "isShowOptionsPageWhenUpdated",
        title: "isShowOptionsPageWhenUpdatedLabel",
        captions: ["isShowOptionsPageWhenUpdatedCaptionLabel"],
        type: "checkbox",
        default: true,
        new: true
      },
      {
        id: "isDebugMode",
        title: "isDebugModeLabel",
        captions: ["isDebugModeCaptionLabel"],
        type: "checkbox",
        default: false,
        new: true
      }
    ]
  }
];
