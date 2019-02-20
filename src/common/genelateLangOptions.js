const alphabeticallySort = (a, b) => a.name.localeCompare(b.name);

export default () => {
  const langListText = browser.i18n.getMessage("langList");
  const langList = langListText.split(", ");
  const langOptions = langList.map(lang => ({
    value: lang.split(":")[0],
    name: lang.split(":")[1]
  }));
  langOptions.sort(alphabeticallySort);
  return langOptions;
};
