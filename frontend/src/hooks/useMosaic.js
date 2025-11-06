import { useState, useCallback, useEffect } from "react";
import { useImageUpload } from "@/hooks/mosaic/useImageUpload";
import { useGridResolution } from "@/hooks/mosaic/useGridResolution";
import { useAdjustmentFilter } from "@/hooks/mosaic/useAdjustmentFilter";
import { usePixelMode } from "@/hooks/mosaic/usePixelMode";
import { useColorManagement } from "@/hooks/mosaic/useColorManagement";

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

  // ==================================== Color Management ===================================
  const {
    colors,
    builtInColors,
    customColors,
    totalCount,
    builtInCount,
    customCount,
    hasCustomColors,
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    exportColorsToCSV,
  } = useColorManagement();

  // ============================= Export Color Dialog State/Actions =============================
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState("all"); // all | custom | pick
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(colors.map((c) => c.id))
  );

  useEffect(() => {
    setSelectedIds(new Set(colors.map((c) => c.id)));
  }, [colors]);

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

  const selectAll = useCallback(
    () => setSelectedIds(new Set(colors.map((c) => c.id))),
    [colors]
  );
  const clearAll = useCallback(() => setSelectedIds(new Set()), []);

  const setMode = useCallback(
    (mode) => {
      setExportMode(mode);
      if (mode === "all") {
        selectAll();
      } else if (mode === "custom") {
        setSelectedIds(new Set(customColors.map((c) => c.id)));
      }
    },
    [customColors, selectAll]
  );

  useEffect(() => {
    if (exportOpen && exportMode === "custom" && customCount === 0) {
      setMode("all");
    }
  }, [exportOpen, exportMode, customCount, setMode]);

  const handleConfirmExport = useCallback(() => {
    let toExport = colors;
    if (exportMode === "custom") {
      toExport = customColors;
    } else if (exportMode === "pick") {
      toExport = colors.filter((c) => selectedIds.has(c.id));
    }
    exportColorsToCSV(toExport);
    setExportOpen(false);
  }, [exportMode, customColors, colors, selectedIds, exportColorsToCSV]);

  // ===================================== Return =====================================
  return {
    // image
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
    // grid
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
    // colors
    colors,
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    hasCustomColors,
    // export
    exportColorsToCSV,
    exportOpen,
    setExportOpen,
    exportMode,
    setExportMode: setMode,
    selectedIds,
    toggleId,
    selectGroup,
    selectAll,
    clearAll,
    builtInColors,
    customColors,
    totalCount,
    builtInCount,
    customCount,
    handleConfirmExport,
  };
};

export default useMosaic;
