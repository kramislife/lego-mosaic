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
    baseGrid,
    width,
    setWidth,
    height,
    setHeight,
    clampToAllowed,
    onSelectBase,
    min,
    max,
    step,
    cols,
    rows,
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
        <UploadImage />
        <Resolution
          baseGrid={baseGrid}
          onSelectBase={onSelectBase}
          min={min}
          max={max}
          step={step}
          width={width}
          height={height}
          onWidth={(v) => setWidth(clampToAllowed(v))}
          onHeight={(v) => setHeight(clampToAllowed(v))}
          cols={cols}
          rows={rows}
        />
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
        <PixelMode pixelMode={pixelMode} setPixelMode={setPixelMode} />
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
        <Export />
      </aside>

      <main className="col-span-12 lg:col-span-8">
        <Preview />
      </main>
    </div>
  );
};

export default Mosaic;
