import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useImageUpload } from "@/hooks/mosaic/useImageUpload";
import { useGridResolution } from "@/hooks/mosaic/useGridResolution";
import { useAdjustmentFilter } from "@/hooks/mosaic/useAdjustmentFilter";
import { usePixelMode } from "@/hooks/mosaic/usePixelMode";
import { useColorManagement } from "@/hooks/mosaic/useColorManagement";
import { downloadMosaicPNG } from "@/utils/exporters/pngExporter";
import { exportMosaicToPDF } from "@/utils/exporters/pdfExport";
import { useMosaicEngine } from "@/hooks/useMosaicEngine";
import { handlePixelClickLogic } from "@/utils/colors/handlePixelClick";
import { handleResetPalette as handleResetPaletteUtil } from "@/utils/colors/tools/resetPalette";

export const useMosaic = () => {
  // ============================== Image Attachment ===============================
  const {
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    croppedImageUrl,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    onCropComplete,
    handleRemoveImage,
    alignCropToAspect,
  } = useImageUpload();

  // =============================== Resolutions & Grid System ===============================
  const {
    baseGrid,
    setBaseGrid,
    width,
    setWidth,
    height,
    setHeight,
    min,
    max,
    step,
    cols,
    rows,
    clampToAllowed,
    onSelectBase,
  } = useGridResolution();

  // ===================================== Adjustments =======================================
  const {
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    imageFilter,
  } = useAdjustmentFilter();

  // =================================== Pixel Display Mode ==================================
  const { pixelMode, setPixelMode } = usePixelMode();
  const [brushPixelMode, setBrushPixelMode] = useState("none");

  useEffect(() => {
    if (width > 0 && height > 0) {
      alignCropToAspect(width / height);
    }
  }, [width, height, alignCropToAspect]);

  // ==================================== Color Management ===================================
  const {
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    customColors,
    hasCustomColors,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    exportColorsToCSV,
    importColorsFromFile,
  } = useColorManagement();

  // ===================================== Mosaic Engine =====================================
  const {
    mosaicUrl,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    removePaletteColor,
    resetExcludedColors,
    resetAllEdits,
    isProcessing: isGeneratingMosaic,
    error: mosaicError,
    gridDimensions,
    pixelGrid,
    editPixelColor,
    erasePixelEdit,
    revertEditsForColor,
  } = useMosaicEngine({
    source: croppedImageUrl,
    width,
    height,
    pixelMode,
    baseGrid,
    imageFilter,
    customColors,
  });

  // ============================= Export Color Dialog State/Actions =============================
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState("all"); // all | custom | pick

  const exportPalette = useMemo(
    () => [...customPaletteUsage, ...imagePalette],
    [customPaletteUsage, imagePalette]
  );

  const availableColors = useMemo(() => {
    // Use the ordering from customPaletteUsage + imagePalette as the base order,
    // but sort primarily by highest -> lowest usage count so "most used" colors
    // appear first. When counts are equal, keep the original sequence so the
    // select matches what you see in the Image Colors / Custom Colors lists.
    const merged = [...customPaletteUsage, ...imagePalette];
    const baseOrder = new Map();
    merged.forEach((color, index) => {
      if (color?.id != null && !baseOrder.has(color.id)) {
        baseOrder.set(color.id, index);
      }
    });

    return merged.slice().sort((a, b) => {
      const aCount = a?.count ?? 0;
      const bCount = b?.count ?? 0;
      if (aCount !== bCount) {
        return bCount - aCount; // higher count first
      }

      const aIndex = baseOrder.get(a.id) ?? 0;
      const bIndex = baseOrder.get(b.id) ?? 0;
      return aIndex - bIndex;
    });
  }, [customPaletteUsage, imagePalette]);
const paletteVersion = useMemo(
  () => availableColors.map((color) => `${color.id}:${color.count}`).join("|"),
  [availableColors]
);
const previousPaletteVersion = useRef(paletteVersion);
const builtInColorCount = imagePalette.length;
const customColorCount = customPaletteUsage.length;
const totalColorCount = builtInColorCount + customColorCount;

const colorLookup = useMemo(() => {
  const lookup = new Map();
  availableColors.forEach((color) => {
    if (color?.id) {
      lookup.set(color.id, color);
    }
  });
  return lookup;
}, [availableColors]);

  const activeColorHex = useMemo(() => {
    if (!activeColorId) return null;
    const color = colorLookup.get(activeColorId);
    return color?.hex ?? null;
  }, [activeColorId, colorLookup]);

  const [selectedIds, setSelectedIds] = useState(
    () => new Set(exportPalette.map((c) => c.id))
  );

  useEffect(() => {
    setSelectedIds(new Set(exportPalette.map((c) => c.id)));
  }, [exportPalette]);

  const toggleId = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectGroup = useCallback((list, value) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const c of list) {
        if (value) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(exportPalette.map((c) => c.id)));
  }, [exportPalette]);

  const clearAll = useCallback(() => setSelectedIds(new Set()), []);

  const setMode = useCallback(
    (mode) => {
      setExportMode(mode);
      if (mode === "all") {
        selectAll();
      } else if (mode === "custom") {
        selectGroup(customPaletteUsage, true);
      }
    },
    [customPaletteUsage, selectAll, selectGroup]
  );

  useEffect(() => {
    if (
      exportOpen &&
      exportMode === "custom" &&
      customPaletteUsage.length === 0
    ) {
      setMode("all");
    }
  }, [exportOpen, exportMode, customPaletteUsage, setMode]);

  const handleConfirmExport = useCallback(() => {
    let toExport = exportPalette;
    if (exportMode === "custom") {
      toExport = customPaletteUsage;
    } else if (exportMode === "pick") {
      toExport = exportPalette.filter((c) => selectedIds.has(c.id));
    }
    exportColorsToCSV(toExport);
    setExportOpen(false);
  }, [
    exportMode,
    exportPalette,
    customPaletteUsage,
    selectedIds,
    exportColorsToCSV,
  ]);

  // ============================= Export Mosaic =============================
  // Check if the mosaic can be exported by checking if the width, height, and pixel grid are valid
  const canExportMosaic =
    width > 0 && height > 0 && Array.isArray(pixelGrid) && pixelGrid.length > 0;

  const handlePixelClick = useCallback(
    ({ row, col }) => {
      handlePixelClickLogic({
        tool,
        row,
        col,
        activeColorId,
        colorLookup,
        editPixelColor,
        erasePixelEdit,
        gridDimensions,
        pixelGrid,
        availableColors,
        setActiveColorId,
        brushPixelMode,
      });
    },
    [
      tool,
      activeColorId,
      colorLookup,
      editPixelColor,
      erasePixelEdit,
      gridDimensions,
      pixelGrid,
      availableColors,
      setActiveColorId,
      brushPixelMode,
    ]
  );

  // Track deleted color IDs to revert edits after state update
  const deletedColorIdsRef = useRef(new Set());

  const handleDeleteCustomColor = useCallback(
    (paletteId) => {
      deleteCustomColor(paletteId);
      // Mark this color for deletion - we'll revert edits after state updates
      deletedColorIdsRef.current.add(paletteId);
    },
    [deleteCustomColor]
  );

  // Revert edits for deleted colors after customColors state has updated
  useEffect(() => {
    if (deletedColorIdsRef.current.size === 0) return;

    const idsToRevert = Array.from(deletedColorIdsRef.current);
    deletedColorIdsRef.current.clear();

    // Revert edits for each deleted color
    idsToRevert.forEach((colorId) => {
      revertEditsForColor(colorId);
    });
  }, [customColors, revertEditsForColor]);

  // Download the mosaic image as a PNG file
  const downloadMosaicImage = useCallback(() => {
    try {
      downloadMosaicPNG({ mosaicUrl, width, height });
    } catch (error) {
      console.error("Error downloading image:", error);
      alert(error?.message ?? "Failed to download image. Please try again.");
    }
  }, [mosaicUrl, width, height]);

  // Download the mosaic instructions as a PDF file
  const downloadMosaicInstructions = useCallback(() => {
    try {
      exportMosaicToPDF({
        width,
        height,
        sectionSize: baseGrid,
        imagePalette,
        customPaletteUsage,
        totalPixels,
        pixelGrid,
        pixelMode,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(
        error?.message ??
          "Failed to export PDF. Please ensure the mosaic is fully generated."
      );
    }
  }, [
    width,
    height,
    baseGrid,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    pixelGrid,
    pixelMode,
  ]);

  const handleResetPalette = useCallback(() => {
    handleResetPaletteUtil({ resetExcludedColors, resetAllEdits });
  }, [resetExcludedColors, resetAllEdits]);

  useEffect(() => {
    if (paletteVersion === previousPaletteVersion.current) {
      return;
    }

    previousPaletteVersion.current = paletteVersion;

    const hasActiveColor =
      activeColorId && availableColors.some((color) => color.id === activeColorId);

    if (hasActiveColor) {
      return;
    }

    const nextColorId = availableColors[0]?.id ?? null;
    setActiveColorId(nextColorId);
  }, [paletteVersion, availableColors, activeColorId, setActiveColorId]);

  return {
    // image attachment
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    croppedImageUrl,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    onCropComplete,
    handleRemoveImage,

    // grid & resolution
    baseGrid,
    setBaseGrid,
    width,
    setWidth,
    height,
    setHeight,
    min,
    max,
    step,
    cols,
    rows,
    clampToAllowed,
    onSelectBase,

    // adjustments
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    imageFilter,

    // pixel mode
    pixelMode,
    setPixelMode,
    brushPixelMode,
    setBrushPixelMode,

    // color management
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    customColors,
    hasCustomColors,
    addCustomColor,
    deleteCustomColor: handleDeleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    exportColorsToCSV,
    importColorsFromFile,

    // export selection state/actions
    exportOpen,
    setExportOpen,
    exportMode,
    setExportMode: setMode,
    selectedIds,
    toggleId,
    selectGroup,
    selectAll,
    clearAll,
    handleConfirmExport,

    // color palette metadata
    availableColors,
    builtInColorCount,
    customColorCount,
    totalColorCount,

    // mosaic engine results
    mosaicUrl,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    removePaletteColor,
    resetExcludedColors: handleResetPalette,
    isGeneratingMosaic,
    mosaicError,
    gridDimensions,
    pixelGrid,

    // export helpers
    canExportMosaic,
    downloadMosaicImage,
    downloadMosaicInstructions,

    // editing
    handlePixelClick,
    activeColorHex,
  };
};

export default useMosaic;
