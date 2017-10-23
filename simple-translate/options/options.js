/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let S = new settingsObj()
let targetLang = document.getElementById("targetLang");
let secondTargetLang = document.getElementById("secondTargetLang");

targetLang.innerHTML=browser.i18n.getMessage("langList");
secondTargetLang.innerHTML=browser.i18n.getMessage("langList");

S.initOptionsPage().then(function(){
    document.getElementById("save").addEventListener('click', function(){
        S.saveOptionsPage();
    });
})

