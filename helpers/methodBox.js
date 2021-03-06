const methodBoxTextConfig = {
  ckmeans:
    "Die unterschiedlich grossen Gruppen kommen durch ein statistisches Verfahren zustande, welches die Werte so in Gruppen einteilt, dass die Unterschiede zwischen den Regionen möglichst gut sichtbar werden (Jenks Natural Breaks).",
  quantile:
    "Die Gruppen wurden so gewählt, dass in jeder Gruppe möglichst gleich viele Werte vorhanden sind.",
  equal:
    "Die Gruppen wurden so gewählt, dass sie jeweils einen gleich grossen Bereich auf der Skala abdecken.",
  custom: "Die Gruppen wurden manuell definiert.",
};

function getMethodBoxInfo(bucketType) {
  const methodBoxText = methodBoxTextConfig[bucketType];
  return {
    text: methodBoxText || "",
    article: process.env.METHOD_BOX_ARTICLE
      ? JSON.parse(process.env.METHOD_BOX_ARTICLE)
      : null,
  };
}

module.exports = { getMethodBoxInfo };
