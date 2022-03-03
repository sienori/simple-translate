import React from "react";
import browser from "webextension-polyfill";
import OptionContainer from "./OptionContainer";
import "../styles/CategoryContainer.scss";

export default props => {
  const { category, elements, currentValues = {} } = props;
  return (
    <li className="categoryContainer">
      <fieldset>
        <legend>
          <p className="categoryTitle">
            {category !== "" ? browser.i18n.getMessage(category) : ""}
          </p>
        </legend>
        <ul className="categoryElements">
          {elements.map((option, index) => (
            <div key={index}>
              <OptionContainer {...option} currentValue={currentValues[option.id]}>
                {option.hasOwnProperty("childElements") && (
                  <ul className="childElements">
                    {option.childElements.map((option, index) => (
                      <OptionContainer {...option} currentValue={currentValues[option.id]} key={index} />
                    ))}
                  </ul>
                )}
              </OptionContainer>
              <hr />
            </div>
          ))}
        </ul>
      </fieldset>
    </li>
  );
};
