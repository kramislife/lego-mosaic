import React from "react";
import UploadImage from "@/components/mosaic/UploadImage";
import Resolution from "@/components/mosaic/Resolution";
import Adjustment from "@/components/mosaic/Adjustment";
import PixelMode from "@/components/mosaic/PixelMode";
import ColorManagement from "@/components/mosaic/ColorManagement/ColorManagement";
import Export from "@/components/mosaic/Export";
import Preview from "@/components/mosaic/Preview";
import { useMosaic } from "@/hooks/useMosaic";
import { useExpand } from "@/contexts/ExpandContext";

const Mosaic = () => {
  const { isExpanded } = useExpand();
  const {
    imageSrc,
    crop,
    setCrop,
    croppedImageUrl,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    onCropComplete,
    handleRemoveImage,
    baseGrid,
    width,
    setWidth,
    height,
    setHeight,
    min,
    max,
    step,
    clampToAllowed,
    onSelectBase,
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    imageFilter,
    pixelMode,
    setPixelMode,
    mosaicUrl,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    removePaletteColor,
    resetExcludedColors,
    isGeneratingMosaic,
    mosaicError,
    pixelGrid,
    downloadMosaicImage,
    downloadMosaicInstructions,
    canExportMosaic,
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
    exportColorsToCSV,
    exportOpen,
    setExportOpen,
    exportMode,
    setExportMode,
    selectedIds,
    toggleId,
    selectGroup,
    selectAll,
    clearAll,
    handleConfirmExport,
    availableColors,
    builtInColorCount,
    customColorCount,
    totalColorCount,
  } = useMosaic();

  const cropAspect = width > 0 && height > 0 ? width / height : undefined;

  const colorManagementProps = {
    tool,
    setTool,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    activeColorId,
    setActiveColorId,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    hasCustomColors,
    exportColorsToCSV,
    exportOpen,
    setExportOpen,
    exportMode,
    setExportMode,
    selectedIds,
    toggleId,
    selectGroup,
    selectAll,
    clearAll,
    handleConfirmExport,
    removePaletteColor,
    resetExcludedColors,
    mosaicError,
    availableColors,
    builtInColorCount,
    customColorCount,
    totalColorCount,
  };

  if (isExpanded) {
    return (
      <div className="w-full p-5 space-y-3">
        {/* Preview - Full Width */}
        <Preview
          croppedImageUrl={croppedImageUrl}
          mosaicImageUrl={mosaicUrl}
          isGenerating={isGeneratingMosaic}
          imageFilter={imageFilter}
          isExpanded={true}
        />
        {/* Color Management - Below Preview */}
        <ColorManagement {...colorManagementProps} />
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-12 gap-3 p-5">
      <aside className="col-span-12 lg:col-span-4 space-y-3">
        {/* Upload Image */}
        <UploadImage
          imageSrc={imageSrc}
          crop={crop}
          setCrop={setCrop}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleImageLoad={handleImageLoad}
          onCropComplete={onCropComplete}
          handleRemoveImage={handleRemoveImage}
          imageFilter={imageFilter}
          cropAspect={cropAspect}
        />
        {/* Adjust Base Grid & Resolution */}
        <Resolution
          baseGrid={baseGrid}
          onSelectBase={onSelectBase}
          width={width}
          height={height}
          onWidth={(v) => setWidth(clampToAllowed(v))}
          onHeight={(v) => setHeight(clampToAllowed(v))}
          min={min}
          max={max}
          step={step}
        />
        {/* Adjustments (HSV, Brightness, Contrast) */}
        <Adjustment
          hue={hue}
          setHue={setHue}
          saturation={saturation}
          setSaturation={setSaturation}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
        />
        {/* Pixel Mode (Square Tiles, Round Tiles, Square Plates, Round Plates) */}
        <PixelMode pixelMode={pixelMode} setPixelMode={setPixelMode} />
        {/* Color Management (Color Picker, Color List, Custom Color) */}
        <ColorManagement {...colorManagementProps} />
        {/* Export (PNG, PDF, XML, CSV) */}
        <Export
          width={width}
          height={height}
          sectionSize={baseGrid}
          imagePalette={imagePalette}
          customPaletteUsage={customPaletteUsage}
          totalPixels={totalPixels}
          pixelGrid={pixelGrid}
          pixelMode={pixelMode}
          mosaicUrl={mosaicUrl}
          onDownloadImage={downloadMosaicImage}
          onDownloadInstructions={downloadMosaicInstructions}
          canExport={canExportMosaic}
        />
      </aside>

      <main className="col-span-12 lg:col-span-8">
        {/* Preview */}
        <Preview
          croppedImageUrl={croppedImageUrl}
          mosaicImageUrl={mosaicUrl}
          isGenerating={isGeneratingMosaic}
          imageFilter={imageFilter}
          isExpanded={false}
        />
      </main>
    </div>
  );
};

export default Mosaic;
