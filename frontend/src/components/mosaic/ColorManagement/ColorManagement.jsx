import React, { useEffect, useRef } from "react";
import { Download, RotateCcw, Palette, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColorExport from "@/components/mosaic/ColorManagement/components/ColorExport";
import { isValidHex } from "@/utils/colors/colorValidator";
import { PIXEL_MODE_OPTIONS, TOOL_OPTIONS } from "@/constant/pixelConfig";

function formatCount(count) {
  return new Intl.NumberFormat().format(count ?? 0);
}

const ColorManagement = ({
  tool,
  setTool,
  imagePalette,
  customPaletteUsage,
  totalPixels,
  activeColorId,
  setActiveColorId,
  brushPixelMode,
  setBrushPixelMode,
  customName,
  setCustomName,
  customHex,
  setCustomHex,
  addCustomColor,
  deleteCustomColor,
  importColorsFromFile,
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
  isVisible = true,
}) => {
  const rootRef = useRef(null);

  // Auto-scroll the selected color into view when activeColorId changes,
  // regardless of where the change originated (select, list click, dropper, etc.).
  useEffect(() => {
    if (!activeColorId || !isVisible) return;

    const root = rootRef.current;
    if (!root) return;

    const target = root.querySelector(`[data-color-id="${activeColorId}"]`);
    if (!target) return;

    // Find the nearest scrollable color list container so we only scroll
    // inside Color Management, not the whole page.
    const container = target.closest("[data-color-scroll-container='true']");
    if (!container) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const offsetWithinContainer =
      targetRect.top - containerRect.top + container.scrollTop;
    const targetCenterOffset =
      offsetWithinContainer -
      container.clientHeight / 2 +
      targetRect.height / 2;

    container.scrollTo({
      top: targetCenterOffset,
      behavior: "smooth",
    });
  }, [activeColorId, isVisible]);

  return (
    <Card ref={rootRef}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Palette className="size-5 text-primary" />
          <CardTitle className="font-sans">
            Color and Pixel Management
          </CardTitle>
        </div>

        <Button
          variant="outline"
          size="sm"
          aria-label="Reset all changes to default"
          title="Reset colors and pixel mode to default"
          onClick={resetExcludedColors}
          disabled={imagePalette.length === 0}
        >
          <RotateCcw className="size-4" /> Reset Canvas
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top row: tool, brush pixel mode, and export in one line */}
        <div className="flex items-center gap-2">
          <Select value={tool} onValueChange={setTool}>
            <SelectTrigger className="grow justify-between">
              <SelectValue placeholder="Select tool" />
            </SelectTrigger>
            <SelectContent>
              {TOOL_OPTIONS.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-foreground" /> {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brushPixelMode} onValueChange={setBrushPixelMode}>
            <SelectTrigger className="grow justify-between">
              <SelectValue placeholder="Pixel mode (default: no change)" />
            </SelectTrigger>
            <SelectContent>
              {PIXEL_MODE_OPTIONS.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="grow justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <ColorExport
                exportMode={exportMode}
                setExportMode={setExportMode}
                selectedIds={selectedIds}
                toggleId={toggleId}
                selectGroup={selectGroup}
                selectAll={selectAll}
                clearAll={clearAll}
                builtInColors={imagePalette}
                customColors={customPaletteUsage}
                totalCount={totalColorCount}
                builtInCount={builtInColorCount}
                customCount={customColorCount}
                onCancel={() => setExportOpen(false)}
                onConfirm={handleConfirmExport}
              />
            </DialogContent>
          </Dialog>
        </div>

        {mosaicError ? (
          <div className="rounded-md border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
            Failed to process image colors. Adjust settings or try another
            image.
          </div>
        ) : null}

        {customPaletteUsage.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold">
                Custom Colors ({customColorCount})
              </Label>
              <span className="text-xs text-muted-foreground">
                Persistent across images
              </span>
            </div>
            <div
              className="space-y-2 max-h-72 overflow-y-auto"
              data-color-scroll-container="true"
            >
              {customPaletteUsage.map((color) => (
                <div
                  key={color.id}
                  data-color-id={color.id}
                  className={`flex items-center gap-1 rounded-md border px-3 py-2 cursor-pointer ${
                    activeColorId === color.id
                      ? "border-primary"
                      : "border-border"
                  }`}
                  onClick={() => setActiveColorId(color.id)}
                >
                  <span
                    className="size-8 rounded-md border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{color.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {color.hex}
                    </span>
                  </div>
                  <Input
                    readOnly
                    value={formatCount(color.count)}
                    className="w-16 text-center"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent hover:text-primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteCustomColor(color.id);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {imagePalette.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold">
                Image Colors ({builtInColorCount})
              </Label>
              <span className="text-xs text-muted-foreground">
                Total studs: {formatCount(totalPixels)}
              </span>
            </div>
            <div
              className="space-y-2 max-h-90 overflow-y-auto"
              data-color-scroll-container="true"
            >
              {imagePalette.map((color) => (
                <div
                  key={color.id}
                  data-color-id={color.id}
                  className={`flex items-center gap-1 rounded-md border px-3 py-2 cursor-pointer ${
                    activeColorId === color.id
                      ? "border-primary"
                      : "border-border"
                  }`}
                  onClick={() => setActiveColorId(color.id)}
                >
                  <span
                    className="size-8 rounded-md border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{color.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {color.hex}
                    </span>
                  </div>
                  <Input
                    readOnly
                    value={formatCount(color.count)}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent hover:text-primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      removePaletteColor(color.id);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label>Color name</Label>
          <Input
            id="custom-name"
            type="text"
            placeholder="Color name (e.g., Neon Pink)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />

          <Label>Hex code</Label>
          <div className="flex items-center gap-2">
            <Input
              id="custom-hex"
              type="text"
              placeholder="#RRGGBB"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
            />
            <Input
              type="color"
              value={isValidHex(customHex) ? customHex : "#000000"}
              onChange={(e) => setCustomHex(e.target.value)}
              className="w-15 p-1 cursor-pointer"
              title="Click to open color picker"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              className="flex-1 py-3 text-base"
              onClick={addCustomColor}
            >
              Add Custom Color
            </Button>

            <input
              type="file"
              accept=".csv,.xlsx,.xls,.xlsm"
              className="hidden"
              id="color-file-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && importColorsFromFile) {
                  importColorsFromFile(file, imagePalette || []);
                }
                e.target.value = ""; // reset
              }}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                document.getElementById("color-file-upload")?.click();
              }}
              title="Upload CSV/Excel Color File"
            >
              <Upload />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorManagement;
