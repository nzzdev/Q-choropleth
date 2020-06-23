<script>
  import Hexagon from "./Hexagon.svelte";
  export let data;
  export let legendData;  
  export let contentWidth;

  const dataMapping = new Map(data);
  const baseSpacing = 18;

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
        customColor: "",
        textColor: "s-color-gray-6"
      };
    }
    if (legendData.type === "numerical") {
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
          customColor: bucket.color.customColor,
          textColor: bucket.color.textColor
        };
      } else {
        return {
          colorClass: "s-color-gray-4",
          customColor: "",
          textColor: "s-color-gray-6"
        };
      }
    } else {
      const categories = legendData.categories;
      const category = categories.find(category => category.label === value);
      if (category) {
        return {
          colorClass: category.color.colorClass,
          customColor: category.color.customColor,
          textColor: category.color.textColor
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
  <svg style="width: {contentWidth}px; height: {contentWidth * 0.6}px;">
    <svg class="swiss-hexagon-map-row" y="0%">
      <Hexagon width={contentWidth/8}
        xIndex=2
        cantonCode="BS"
        value={getValue('BS', data)}
        color={getColor('BS', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=3
        cantonCode="BL"
        value={getValue('BL', data)}
        color={getColor('BL', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=4
        cantonCode="SH"
        value={getValue('SH', data)}
        color={getColor('SH', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=5
        cantonCode="TG"
        value={getValue('TG', data)}
        color={getColor('TG', legendData)} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 1}%">
      <Hexagon width={contentWidth/8}
        xIndex=1.5
        cantonCode="JU"
        value={getValue('JU', data)}
        color={getColor('JU', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=2.5
        cantonCode="SO"
        value={getValue('SO', data)}
        color={getColor('SO', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=3.5
        cantonCode="AG"
        value={getValue('AG', data)}
        color={getColor('AG', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=4.5
        cantonCode="ZH"
        value={getValue('ZH', data)}
        color={getColor('ZH', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=5.5
        cantonCode="AR"
        value={getValue('AR', data)}
        color={getColor('AR', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=6.5
        cantonCode="AI"
        value={getValue('AI', data)}
        color={getColor('AI', legendData)} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 2}%">
      <Hexagon width={contentWidth/8}
        xIndex=1
        cantonCode="NE"
        value={getValue('NE', data)}
        color={getColor('NE', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=2
        cantonCode="BE"
        value={getValue('BE', data)}
        color={getColor('BE', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=3
        cantonCode="LU"
        value={getValue('LU', data)}
        color={getColor('LU', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=4
        cantonCode="ZG"
        value={getValue('ZG', data)}
        color={getColor('ZG', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=5
        cantonCode="SZ"
        value={getValue('SZ', data)}
        color={getColor('SZ', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=6
        cantonCode="SG"
        value={getValue('SG', data)}
        color={getColor('SG', legendData)} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 3}%">
      <Hexagon width={contentWidth/8}
        xIndex=0.5
        cantonCode="VD"
        value={getValue('VD', data)}
        color={getColor('VD', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=1.5
        cantonCode="FR"
        value={getValue('FR', data)}
        color={getColor('FR', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=2.5
        cantonCode="OW"
        value={getValue('OW', data)}
        color={getColor('OW', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=3.5
        cantonCode="NW"
        value={getValue('NW', data)}
        color={getColor('NW', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=4.5
        cantonCode="UR"
        value={getValue('UR', data)}
        color={getColor('UR', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=5.5
        cantonCode="GL"
        value={getValue('GL', data)}
        color={getColor('GL', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=6.5
        cantonCode="GR"
        value={getValue('GR', data)}
        color={getColor('GR', legendData)} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 4}%">
      <Hexagon width={contentWidth/8}
        xIndex=0
        cantonCode="GE"
        value={getValue('GE', data)}
        color={getColor('GE', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=2
        cantonCode="VS"
        value={getValue('VS', data)}
        color={getColor('VS', legendData)} />
      <Hexagon width={contentWidth/8}
        xIndex=5
        cantonCode="TI"
        value={getValue('TI', data)}
        color={getColor('TI', legendData)} />
    </svg>
  </svg>
</div>
