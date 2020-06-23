<script>
  import Hexagon from "./Hexagon.svelte";
  export let data;
  export let legendData;
  export let entityMapping;

  const dataMapping = new Map(data);

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
  <div class="swiss-hexagon-map-row">
    <Hexagon type="empty" />
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="BS"
      value={getValue('BS')}
      color={getColor('BS', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="BL"
      value={getValue('BL')}
      color={getColor('BL', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SH"
      value={getValue('SH')}
      color={getColor('SH', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="TG"
      value={getValue('TG')}
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
      value={getValue('JU')}
      color={getColor('JU', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SO"
      value={getValue('SO')}
      color={getColor('SO', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="AG"
      value={getValue('AG')}
      color={getColor('AG', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="ZH"
      value={getValue('ZH')}
      color={getColor('ZH', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="AR"
      value={getValue('AR')}
      color={getColor('AR', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="AI"
      value={getValue('AI')}
      color={getColor('AI', legendData)} />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="NE"
      value={getValue('NE')}
      color={getColor('NE', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="BE"
      value={getValue('BE')}
      color={getColor('BE', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="LU"
      value={getValue('LU')}
      color={getColor('LU', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="ZG"
      value={getValue('ZG')}
      color={getColor('ZG', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SZ"
      value={getValue('SZ')}
      color={getColor('SZ', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="SG"
      value={getValue('SG')}
      color={getColor('SG', legendData)} />
    <Hexagon type="empty-half" />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon type="empty-half" />
    <Hexagon
      type="canton"
      cantonCode="VD"
      value={getValue('VD')}
      color={getColor('VD', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="FR"
      value={getValue('FR')}
      color={getColor('FR', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="OW"
      value={getValue('OW')}
      color={getColor('OW', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="NW"
      value={getValue('NW')}
      color={getColor('NW', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="UR"
      value={getValue('UR')}
      color={getColor('UR', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="GL"
      value={getValue('GL')}
      color={getColor('GL', legendData)} />
    <Hexagon
      type="canton"
      cantonCode="GR"
      value={getValue('GR')}
      color={getColor('GR', legendData)} />
  </div>
  <div class="swiss-hexagon-map-row swiss-hexagon-map-row--pushed">
    <Hexagon
      type="canton"
      cantonCode="GE"
      value={getValue('GE')}
      color={getColor('GE', legendData)} />
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="VS"
      value={getValue('VS')}
      color={getColor('VS', legendData)} />
    <Hexagon type="empty" />
    <Hexagon type="empty" />
    <Hexagon
      type="canton"
      cantonCode="TI"
      value={getValue('TI')}
      color={getColor('TI', legendData)} />
    <Hexagon type="empty" />
    <Hexagon type="empty-half" />
  </div>
</div>
