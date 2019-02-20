/* Copyright (c) 2017-2018 Sienori All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let e = {};
e.hash = location.href;

if (e.hash.indexOf("#") != -1) {
  e.hash = "#" + e.hash.split("#")[1];
} else {
  e.hash = "#settings";
}
readHash(e);

// hash の監視を開始
tm.HashObserver.enable();
document.addEventListener("changehash", readHash, false);

function readHash(e) {
  const hash = e.hash.split("?")[0];

  let selected = document.getElementsByClassName("selected");
  selected[0].classList.remove("selected");

  document.getElementById("settings").style.display = "none";
  document.getElementById("information").style.display = "none";

  switch (hash) {
    case "#settings":
      document.getElementById("settings").style.display = "block";
      document.getElementsByClassName("settingsLabel")[0].classList.add("selected");
      break;
    case "#information":
      document.getElementById("information").style.display = "block";
      document.getElementsByClassName("informationLabel")[0].classList.add("selected");
      break;
    default:
      document.getElementById("settings").style.display = "block";
      document.getElementsByClassName("settingsLabel")[0].classList.add("selected");
      break;
  }

  const params = getParams(e.hash);
  switch (params.action) {
    case "updated":
      showUpdated();
      break;
  }
}

function getParams(hash) {
  let params = {};
  if (hash.split("?")[1] == undefined) return params;
  hash = hash.split("?")[1].split("&");
  for (let i of hash) {
    params[i.split("=")[0]] = i.split("=")[1];
  }
  return params;
}

function showUpdated() {
  const version = document.getElementsByClassName("addonVersion")[0];
  version.classList.add("updated");
}

document.getElementsByClassName("addonUrl")[0].href = browser.i18n.getMessage("addonUrl");
document.getElementsByClassName("amazonUrl")[0].href = browser.i18n.getMessage("amazonUrl");
document
  .getElementsByClassName("addonVersion")[0]
  .getElementsByClassName("caption")[0]
  .getElementsByTagName("a")[0].innerText = `Version ${browser.runtime.getManifest().version}`;
