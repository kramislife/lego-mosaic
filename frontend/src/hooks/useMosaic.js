import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useImageUpload } from "@/hooks/mosaic/useImageUpload";
import { useGridResolution } from "@/hooks/mosaic/useGridResolution";
import { useAdjustmentFilter } from "@/hooks/mosaic/useAdjustmentFilter";
import { usePixelMode } from "@/hooks/mosaic/usePixelMode";
import { useColorManagement } from "@/hooks/mosaic/useColorManagement";
import { downloadMosaicPNG } from "@/utils/exporters/pngExporter";
import { exportMosaicToPDF } from "@/utils/exporters/pdfExport";
import { useMosaicEngine } from "@/hooks/useMosaicEngine";

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
  } = useColorManagement();

  // ===================================== Mosaic Engine =====================================
  const {
    mosaicUrl,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    removePaletteColor,
    resetExcludedColors,
    isProcessing: isGeneratingMosaic,
    error: mosaicError,
    gridDimensions,
    pixelGrid,
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

const availableColors = useMemo(
  () => [...customPaletteUsage, ...imagePalette],
  [customPaletteUsage, imagePalette]
);
const paletteVersion = useMemo(
  () => availableColors.map((color) => `${color.id}:${color.count}`).join("|"),
  [availableColors]
);
const previousPaletteVersion = useRef(paletteVersion);
const builtInColorCount = imagePalette.length;
const customColorCount = customPaletteUsage.length;
const totalColorCount = builtInColorCount + customColorCount;

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

useEffect(() => {
  if (paletteVersion === previousPaletteVersion.current) {
    return;
  }
  previousPaletteVersion.current = paletteVersion;
  const nextColorId = availableColors[0]?.id ?? null;
  setActiveColorId(nextColorId);
}, [paletteVersion, availableColors, setActiveColorId]);

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
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    exportColorsToCSV,

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
    resetExcludedColors,
    isGeneratingMosaic,
    mosaicError,
    gridDimensions,
    pixelGrid,

    // export helpers
    canExportMosaic,
    downloadMosaicImage,
    downloadMosaicInstructions,
  };
};

export default useMosaic;
