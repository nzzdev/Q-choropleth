<script>
  import Hexagon from "./Hexagon.svelte";
  export let data;
  export let legendData;

  const dataMapping = new Map(data);

  // just temporary - mapping will be done separately
  const cantons = [
    { id: 1, code: "ZH", name: "Zürich", article: "in" },
    { id: 2, code: "BE", name: "Bern", article: "in" },
    { id: 3, code: "LU", name: "Luzern", article: "in" },
    { id: 4, code: "UR", name: "Uri", article: "in" },
    { id: 5, code: "SZ", name: "Schwyz", article: "in" },
    { id: 6, code: "OW", name: "Obwalden", article: "in" },
    { id: 7, code: "NW", name: "Nidwalden", article: "in" },
    { id: 8, code: "GL", name: "Glarus", article: "in" },
    { id: 9, code: "ZG", name: "Zug", article: "in" },
    { id: 10, code: "FR", name: "Freiburg", article: "in" },
    { id: 11, code: "SO", name: "Solothurn", article: "in" },
    { id: 12, code: "BS", name: "Basel-Stadt", article: "in" },
    { id: 13, code: "BL", name: "Basel-Landschaft", article: "in" },
    { id: 14, code: "SH", name: "Schaffhausen", article: "in" },
    { id: 15, code: "AR", name: "Appenzell Ausserrhoden", article: "in" },
    { id: 16, code: "AI", name: "Appenzell Innerrhoden", article: "in" },
    { id: 17, code: "SG", name: "St. Gallen", article: "in" },
    { id: 18, code: "GR", name: "Graubünden", article: "in" },
    { id: 19, code: "AG", name: "Aargau", article: "im" },
    { id: 20, code: "TG", name: "Thurgau", article: "im" },
    { id: 21, code: "TI", name: "Tessin", article: "im" },
    { id: 22, code: "VD", name: "Waadt", article: "in der" },
    { id: 23, code: "VS", name: "Wallis", article: "im" },
    { id: 24, code: "NE", name: "Neuenburg", article: "in" },
    { id: 25, code: "GE", name: "Genf", article: "in" },
    { id: 26, code: "JU", name: "Jura", article: "im" }
  ];

  const codeToName = new Map(cantons.map(({ code, name }) => [code, name]));

  function getValue(cantonCode, data) {
    const cantonName = codeToName.get(cantonCode);
    return dataMapping.get(cantonName);
  }

  function getColor(cantonCode, legendData) {
    const value = getValue(cantonCode);
    if (value === null || value === undefined) {
      return {
        colorClass: "s-color-gray-4",
        customColor: ""
      };
    }
    if (legendData.type === "quantitative") {
      const buckets = legendData.buckets;
      const bucket = buckets.find((bucket, index) => {
        if (index === 0) {
          return value <= bucket.to;
        } else if (index === buckets.length - 1) {
          return bucket.from < value;
        } else {
          return bucket.from < value && value <= bucket.to;
        }
      });
      if (bucket) {
        return {
          colorClass: bucket.color.colorClass,
          customColor: bucket.color.customColor
        };
      } else {
        return {
          colorClass: "s-color-gray-4",
          customColor: ""
        };
      }
    } else {
      const categories = legendData.categories;
      const category = categories.find(category => category.label === value);
      if (category) {
        return {
          colorClass: category.color.colorClass,
          customColor: category.color.customColor
        };
      } else {
        return {
          colorClass: "s-color-gray-4",
          customColor: ""
        };
      }
    }
  }
</script>

<div class="swiss-hexagon-map">
  <div class="swiss-hexagon-map-row">
    <Hexagon type="empty" />
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="BS"
      value={getValue('BS', data)}
      color={getColor('BS', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="BL"
      value={getValue('BL', data)}
      color={getColor('BL', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SH"
      value={getValue('SH', data)}
      color={getColor('SH', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="TG"
      value={getValue('TG', data)}
      color={getColor('TG', legendData)} />
    <Hexagon type="empty" />
    <Hexagon type="empty-half" />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon type="empty" />
    <Hexagon type="empty-half" />
    <Hexagon
      type="canton"
      cantonCode="JU"
      value={getValue('JU', data)}
      color={getColor('JU', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SO"
      value={getValue('SO', data)}
      color={getColor('SO', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="AG"
      value={getValue('AG', data)}
      color={getColor('AG', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="ZH"
      value={getValue('ZH', data)}
      color={getColor('ZH', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="AR"
      value={getValue('AR', data)}
      color={getColor('AR', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="AI"
      value={getValue('AI', data)}
      color={getColor('AI', legendData)} />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="NE"
      value={getValue('NE', data)}
      color={getColor('NE', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="BE"
      value={getValue('BE', data)}
      color={getColor('BE', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="LU"
      value={getValue('LU', data)}
      color={getColor('LU', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="ZG"
      value={getValue('ZG', data)}
      color={getColor('ZG', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SZ"
      value={getValue('SZ', data)}
      color={getColor('SZ', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SG"
      value={getValue('SG', data)}
      color={getColor('SG', legendData)} />
    <Hexagon type="empty-half" />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon type="empty-half" />
    <Hexagon
      type="canton"
      cantonCode="VD"
      value={getValue('VD', data)}
      color={getColor('VD', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="FR"
      value={getValue('FR', data)}
      color={getColor('FR', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="OW"
      value={getValue('OW', data)}
      color={getColor('OW', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="NW"
      value={getValue('NW', data)}
      color={getColor('NW', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="UR"
      value={getValue('UR', data)}
      color={getColor('UR', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="GL"
      value={getValue('GL', data)}
      color={getColor('GL', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="GR"
      value={getValue('GR', data)}
      color={getColor('GR', legendData)} />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon
      type="canton"
      cantonCode="GE"
      value={getValue('GE', data)}
      color={getColor('GE', legendData)} />
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="VS"
      value={getValue('VS', data)}
      color={getColor('VS', legendData)} />
    <Hexagon type="empty" />
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="TI"
      value={getValue('TI', data)}
      color={getColor('TI', legendData)} />
    <Hexagon type="empty" />
    <Hexagon type="empty-half" />
  </div>
</div>
