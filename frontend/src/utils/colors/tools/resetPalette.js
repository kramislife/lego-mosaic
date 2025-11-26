export const resetAllEditsOnGrid = ({
  basePixelGridRef,
  pixelGridRef,
  editedPixelsRef,
  availablePalette,
  preparedCustomPalette,
}) => {
  const basePixels = basePixelGridRef.current;
  if (!Array.isArray(basePixels) || !basePixels.length) {
    editedPixelsRef.current = new Map();
    return null;
  }

  // Reset grid to baseline pixels
  pixelGridRef.current = basePixels.map((p) => ({ ...p }));
  editedPixelsRef.current = new Map();

  // Rebuild usage map from baseline grid
  const usageMap = new Map();
  const paletteLookup = new Map(
    availablePalette.map((entry) => [entry.id, entry])
  );

  pixelGridRef.current.forEach((pixel) => {
    if (!pixel || !pixel.colorId) return;
    const colorId = pixel.colorId;
    let entry = usageMap.get(colorId);
    if (!entry) {
      const paletteColor = paletteLookup.get(colorId);
      entry = {
        id: colorId,
        name: paletteColor?.name ?? pixel.name ?? "",
        hex: paletteColor?.hex ?? pixel.hex,
        isCustom: Boolean(
          paletteColor?.isCustom ?? pixel.isCustom ?? false
        ),
        count: 0,
      };
      usageMap.set(colorId, entry);
    }
    entry.count = (entry.count || 0) + 1;
  });

  // Ensure all custom colors appear in usage map (even if count is 0)
  preparedCustomPalette.forEach((customColor) => {
    if (!usageMap.has(customColor.id)) {
      usageMap.set(customColor.id, {
        id: customColor.id,
        name: customColor.name,
        hex: customColor.hex,
        isCustom: true,
        count: 0,
      });
    }
  });

  return usageMap;
};

// UI-level helper to wire Reset Palette button
export const handleResetPalette = ({ resetExcludedColors, resetAllEdits }) => {
  resetExcludedColors();
  resetAllEdits();
};


