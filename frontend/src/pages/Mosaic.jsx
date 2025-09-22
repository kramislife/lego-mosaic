import React from "react";
import UploadImage from "@/components/mosaic/UploadImage";
import Resolution from "@/components/mosaic/Resolution";
import Adjustment from "@/components/mosaic/Adjustment";
import PixelMode from "@/components/mosaic/PixelMode";
import ColorManagement from "@/components/mosaic/ColorManagement";
import Export from "@/components/mosaic/Export";
import Preview from "@/components/mosaic/Preview";
import { useMosaic } from "@/hooks/useMosaic";

const Mosaic = () => {
  const {
    imageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    handleRemoveImage,
    baseGrid,
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
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    pixelMode,
    setPixelMode,
    colors,
    colorsLoading,
    colorsError,
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
  } = useMosaic();

  return (
    <div className="w-full grid grid-cols-12 gap-3 p-5">
      <aside className="col-span-12 lg:col-span-4 space-y-3">
        {/* Upload Image */}
        <UploadImage
          imageSrc={imageSrc}
          crop={crop}
          setCrop={setCrop}
          zoom={zoom}
          setZoom={setZoom}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleImageLoad={handleImageLoad}
          handleRemoveImage={handleRemoveImage}
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
          cols={cols}
          rows={rows}
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
        {/* Pixel Mode (Square, Circle, Concentric Square, Concentric Circle) */}
        <PixelMode pixelMode={pixelMode} setPixelMode={setPixelMode} />
        {/* Color Management (Color Picker, Color List, Custom Color) */}
        <ColorManagement
          tool={tool}
          setTool={setTool}
          colors={colors}
          colorsLoading={colorsLoading}
          colorsError={colorsError}
          activeColorId={activeColorId}
          setActiveColorId={setActiveColorId}
          customName={customName}
          setCustomName={setCustomName}
          customHex={customHex}
          setCustomHex={setCustomHex}
        />
        {/* Export (PNG, PDF, XML, CSV) */}
        <Export />
      </aside>

      <main className="col-span-12 lg:col-span-8">
        {/* Preview */}
        <Preview />
      </main>
    </div>
  );
};

export default Mosaic;
