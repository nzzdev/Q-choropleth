<script>
  import Hexagon from "./Hexagon.svelte";
  export let data;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let entityMapping;

  const dataMapping = new Map(data);
  const baseSpacing = 18;

  function getValue(cantonCode) {
    try {
      const entity = entityMapping.get(cantonCode);
      return dataMapping.get(entity);
    } catch (e) {
      return null;
    }
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
      <Hexagon
        width={contentWidth / 8}
        xIndex="2"
        cantonCode="BS"
        value={getValue('BS')}
        color={getColor('BS', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="3"
        cantonCode="BL"
        value={getValue('BL')}
        color={getColor('BL', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="4"
        cantonCode="SH"
        value={getValue('SH')}
        color={getColor('SH', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="5"
        cantonCode="TG"
        value={getValue('TG')}
        color={getColor('TG', legendData)}
        {valuesOnMap} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 1}%">
      <Hexagon
        width={contentWidth / 8}
        xIndex="1.5"
        cantonCode="JU"
        value={getValue('JU')}
        color={getColor('JU', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="2.5"
        cantonCode="SO"
        value={getValue('SO')}
        color={getColor('SO', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="3.5"
        cantonCode="AG"
        value={getValue('AG')}
        color={getColor('AG', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="4.5"
        cantonCode="ZH"
        value={getValue('ZH')}
        color={getColor('ZH', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="5.5"
        cantonCode="AR"
        value={getValue('AR')}
        color={getColor('AR', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="6.5"
        cantonCode="AI"
        value={getValue('AI')}
        color={getColor('AI', legendData)}
        {valuesOnMap} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 2}%">
      <Hexagon
        width={contentWidth / 8}
        xIndex="1"
        cantonCode="NE"
        value={getValue('NE')}
        color={getColor('NE', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="2"
        cantonCode="BE"
        value={getValue('BE')}
        color={getColor('BE', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="3"
        cantonCode="LU"
        value={getValue('LU')}
        color={getColor('LU', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="4"
        cantonCode="ZG"
        value={getValue('ZG')}
        color={getColor('ZG', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="5"
        cantonCode="SZ"
        value={getValue('SZ')}
        color={getColor('SZ', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="6"
        cantonCode="SG"
        value={getValue('SG')}
        color={getColor('SG', legendData)}
        {valuesOnMap} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 3}%">
      <Hexagon
        width={contentWidth / 8}
        xIndex="0.5"
        cantonCode="VD"
        value={getValue('VD')}
        color={getColor('VD', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="1.5"
        cantonCode="FR"
        value={getValue('FR')}
        color={getColor('FR', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="2.5"
        cantonCode="OW"
        value={getValue('OW')}
        color={getColor('OW', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="3.5"
        cantonCode="NW"
        value={getValue('NW')}
        color={getColor('NW', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="4.5"
        cantonCode="UR"
        value={getValue('UR')}
        color={getColor('UR', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="5.5"
        cantonCode="GL"
        value={getValue('GL')}
        color={getColor('GL', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="6.5"
        cantonCode="GR"
        value={getValue('GR')}
        color={getColor('GR', legendData)}
        {valuesOnMap} />
    </svg>
    <svg class="swiss-hexagon-map-row" y="{baseSpacing * 4}%">
      <Hexagon
        width={contentWidth / 8}
        xIndex="0"
        cantonCode="GE"
        value={getValue('GE')}
        color={getColor('GE', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="2"
        cantonCode="VS"
        value={getValue('VS')}
        color={getColor('VS', legendData)}
        {valuesOnMap} />
      <Hexagon
        width={contentWidth / 8}
        xIndex="5"
        cantonCode="TI"
        value={getValue('TI')}
        color={getColor('TI', legendData)}
        {valuesOnMap} />
    </svg>
  </svg>
</div>
