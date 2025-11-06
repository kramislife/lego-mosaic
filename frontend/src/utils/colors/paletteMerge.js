export function mergePalette(legoColors = [], customColors = []) {
  return [
    ...customColors.map((c) => ({ ...c, isCustom: true })),
    ...legoColors.map((c) => ({ ...c, isCustom: false })),
  ];
}

export function splitPalette(palette = []) {
  const builtInColors = palette.filter((c) => !c.isCustom);
  const customOnly = palette.filter((c) => c.isCustom);
  return { builtInColors, customColors: customOnly };
}

export function computeCounts(palette = []) {
  const totalCount = palette.length;
  const builtInCount = palette.filter((c) => !c.isCustom).length;
  const customCount = totalCount - builtInCount;
  return { totalCount, builtInCount, customCount };
}

export default { mergePalette, splitPalette, computeCounts };
