import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { BRICKLINK_COLORS } from "@/constant/colorConfig";
import { preparePalette } from "@/utils/colors/colorMatcher";
import {
  loadImage,
  resizeImageToExactDimensions,
  samplePixels,
} from "@/utils/image/imageProcessing";
import { determineCellSize } from "@/utils/grid/cellSize";
import { mapPixelsToPalette } from "@/utils/colors/mapPixelsToPalette";
import { renderMappedPixels } from "@/utils/render/renderMappedPixels";
import { paintPixel } from "@/utils/colors/tools/paint";
import { erasePixel, erasePixelsByColorId } from "@/utils/colors/tools/eraser";
import { resetAllEditsOnGrid } from "@/utils/colors/tools/resetPalette";

const GENERATION_DELAY_MS = 300;
const BASE_PALETTE = preparePalette(
  BRICKLINK_COLORS.map((color) => ({ ...color, isCustom: false }))
);

export const useMosaicEngine = ({
  source,
  width,
  height,
  pixelMode,
  baseGrid,
  imageFilter,
  customColors = [],
}) => {
  const [mosaicUrl, setMosaicUrl] = useState(null);
  const [imagePalette, setImagePalette] = useState([]);
  const [customPaletteUsage, setCustomPaletteUsage] = useState([]);
  const [totalPixels, setTotalPixels] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [excludedColorIds, setExcludedColorIds] = useState([]);
  const pixelGridRef = useRef([]);
  const basePixelGridRef = useRef([]);
  const editedPixelsRef = useRef(new Map());
  const [pixelVersion, setPixelVersion] = useState(0);
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
    cellSize: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  });
  const usageMapRef = useRef(new Map());
  const ensureUsageEntry = useCallback((color) => {
    if (!color || !color.id) return null;
    if (!usageMapRef.current.has(color.id)) {
      usageMapRef.current.set(color.id, {
        id: color.id,
        name: color.name,
        hex: color.hex,
        isCustom: Boolean(color.isCustom),
        count: 0,
      });
    }
    return usageMapRef.current.get(color.id);
  }, []);


  const requestRef = useRef(0);
  const timeoutRef = useRef(null);
  const sampleKeyRef = useRef(null);
  const rawDataRef = useRef(null);
  const preparedCustomPaletteRef = useRef([]);

  const preparedCustomPalette = useMemo(
    () => preparePalette(customColors.map((c) => ({ ...c, isCustom: true }))),
    [customColors]
  );

  // Keep ref in sync with current preparedCustomPalette to avoid stale closures
  useEffect(() => {
    preparedCustomPaletteRef.current = preparedCustomPalette;
  }, [preparedCustomPalette]);

  const availablePalette = useMemo(() => {
    const excluded = new Set(excludedColorIds);

    // Fast path: no exclusions, just use base palette as-is so the reference
    // stays stable when only custom colors change.
    if (excluded.size === 0) {
      return BASE_PALETTE;
    }

    const paletteEntries = [...preparedCustomPalette, ...BASE_PALETTE];
    return paletteEntries.filter((entry) => !excluded.has(entry.id));
  }, [preparedCustomPalette, excludedColorIds]);

  const syncUsageState = useCallback(() => {
    const builtIn = [];
    const customEntries = new Map();

    usageMapRef.current.forEach((entry) => {
      if (entry.isCustom) {
        customEntries.set(entry.id, { ...entry });
      } else if (entry.count > 0) {
        builtIn.push({ ...entry });
      }
    });

    // Read from ref to avoid stale closure when called immediately after state updates
    const currentPreparedPalette = preparedCustomPaletteRef.current;
    const orderedCustom = currentPreparedPalette.map((customColor) => {
      if (customEntries.has(customColor.id)) {
        return customEntries.get(customColor.id);
      }
      return {
        id: customColor.id,
        name: customColor.name,
        hex: customColor.hex,
        isCustom: true,
        count: 0,
      };
    });

    builtIn.sort((a, b) => b.count - a.count);
    orderedCustom.sort((a, b) => b.count - a.count);

    setImagePalette(builtIn);
    setCustomPaletteUsage(orderedCustom);
  }, []);

  const dependencies = useMemo(
    () => ({
      source,
      width,
      height,
      baseGrid,
      imageFilter,
    }),
    [source, width, height, baseGrid, imageFilter]
  );

  useEffect(() => {
    const { source: src, width: w, height: h } = dependencies;
    if (!src || !w || !h) {
      setMosaicUrl(null);
      setImagePalette([]);
      setCustomPaletteUsage(
        preparedCustomPalette.map((entry) => ({
          id: entry.id,
          name: entry.name,
          hex: entry.hex,
          isCustom: true,
          count: 0,
        }))
      );
      setTotalPixels(0);
      pixelGridRef.current = [];
      basePixelGridRef.current = [];
      editedPixelsRef.current = new Map();
      setPixelVersion((version) => version + 1);
      setGridDimensions({
        width: 0,
        height: 0,
        cellSize: 0,
        canvasWidth: 0,
        canvasHeight: 0,
      });
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsProcessing(true);
    setError(null);

    const sampleKey = JSON.stringify({
      src,
      w,
      h,
      filter: dependencies.imageFilter,
    });
    const needsResample = sampleKeyRef.current !== sampleKey;

    timeoutRef.current = setTimeout(async () => {
      try {
        if (needsResample || !rawDataRef.current) {
          // New image / size / filter: clear manual edits
          editedPixelsRef.current = new Map();

          const image = await loadImage(src);
          const sampleWidth = Math.max(1, Math.round(w));
          const sampleHeight = Math.max(1, Math.round(h));

          // Resize image to exact target dimensions to ensure perfect 1:1 pixel mapping
          const resizedImage = await resizeImageToExactDimensions(
            image,
            sampleWidth,
            sampleHeight
          );

          const sampled = samplePixels(
            resizedImage,
            sampleWidth,
            sampleHeight,
            dependencies.imageFilter
          );
          rawDataRef.current = {
            width: sampleWidth,
            height: sampleHeight,
            pixels: sampled,
          };
          sampleKeyRef.current = sampleKey;
          setExcludedColorIds((prev) => (prev.length ? [] : prev));
        }

        const rawData = rawDataRef.current;
        if (!rawData || !availablePalette.length) {
          if (requestRef.current === requestId) {
            setImagePalette([]);
            setCustomPaletteUsage([]);
            setMosaicUrl(null);
            setTotalPixels(0);
            pixelGridRef.current = [];
            setPixelVersion((version) => version + 1);
            setGridDimensions({
              width: 0,
              height: 0,
              cellSize: 0,
              canvasWidth: 0,
              canvasHeight: 0,
            });
            setIsProcessing(false);
          }
          return;
        }

        // Process color matching asynchronously in batches
        const mapping = await mapPixelsToPalette(
          rawData.pixels,
          availablePalette
        );

        if (requestRef.current !== requestId) return;

        const cellSize = determineCellSize(rawData.width, rawData.height);

        // Start from the freshly mapped pixels (baseline, without manual edits)
        const basePixels = Array.isArray(mapping.mappedPixels)
          ? [...mapping.mappedPixels]
          : [];

        // Drop any manual edits that reference colors no longer in the palette
        if (editedPixelsRef.current.size) {
          const allowedIds = new Set(
            availablePalette.map((entry) => entry.id)
          );
          editedPixelsRef.current.forEach((override, index) => {
            if (!allowedIds.has(override.colorId)) {
              editedPixelsRef.current.delete(index);
            }
          });
        }

        // Re-apply remaining manual edits on top of the automatic mapping
        const mappedPixels = basePixels.length ? [...basePixels] : [];

        if (mappedPixels.length && editedPixelsRef.current.size) {
          editedPixelsRef.current.forEach((override, index) => {
            if (!mappedPixels[index]) return;
            mappedPixels[index] = {
              ...mappedPixels[index],
              colorId: override.colorId,
              hex: override.hex,
              isCustom: Boolean(override.isCustom),
              pixelModeOverride:
                override.pixelModeOverride ??
                mappedPixels[index].pixelModeOverride ??
                null,
            };
          });
        }

        // Rebuild usage map from the final pixel grid (including remaining overrides)
        const usageMap = new Map();
        const paletteLookup = new Map(
          availablePalette.map((entry) => [entry.id, entry])
        );

        mappedPixels.forEach((pixel) => {
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

        usageMapRef.current = usageMap;
        syncUsageState();

        setTotalPixels(rawData.width * rawData.height);
        basePixelGridRef.current = basePixels;
        pixelGridRef.current = mappedPixels;
        setPixelVersion((version) => version + 1);
        setGridDimensions({
          width: rawData.width,
          height: rawData.height,
          cellSize,
          canvasWidth: rawData.width * cellSize,
          canvasHeight: rawData.height * cellSize,
        });
      } catch (err) {
        if (requestRef.current !== requestId) return;
        console.error("Mosaic generation failed", err);
        setError(
          err instanceof Error ? err : new Error("Failed to generate mosaic")
        );
        setMosaicUrl(null);
        usageMapRef.current = new Map();
        setImagePalette([]);
        setCustomPaletteUsage([]);
        setTotalPixels(0);
        pixelGridRef.current = [];
        setPixelVersion((version) => version + 1);
        setGridDimensions({
          width: 0,
          height: 0,
          cellSize: 0,
          canvasWidth: 0,
          canvasHeight: 0,
        });
      } finally {
        if (requestRef.current === requestId) {
          setIsProcessing(false);
        }
      }
    }, GENERATION_DELAY_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [dependencies, availablePalette]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setMosaicUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCustomPaletteUsage([]);
      pixelGridRef.current = [];
      setPixelVersion((version) => version + 1);
      setGridDimensions({
        width: 0,
        height: 0,
        cellSize: 0,
        canvasWidth: 0,
        canvasHeight: 0,
      });
    };
  }, []);

  const removePaletteColor = useCallback((colorId) => {
    setExcludedColorIds((prev) =>
      prev.includes(colorId) ? prev : [...prev, colorId]
    );
  }, []);

  const resetExcludedColors = useCallback(() => {
    setExcludedColorIds([]);
  }, []);

  useEffect(() => {
    preparedCustomPalette.forEach((customColor) => {
      if (!usageMapRef.current.has(customColor.id)) {
        usageMapRef.current.set(customColor.id, {
          id: customColor.id,
          name: customColor.name,
          hex: customColor.hex,
          isCustom: true,
          count: 0,
        });
      }
    });
    syncUsageState();
  }, [preparedCustomPalette, syncUsageState]);

  useEffect(() => {
    const pixels = pixelGridRef.current;
    if (
      !pixels.length ||
      !gridDimensions.width ||
      !gridDimensions.height ||
      !gridDimensions.cellSize
    ) {
      setMosaicUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const rendered = renderMappedPixels(
      pixels,
      gridDimensions.width,
      gridDimensions.height,
      gridDimensions.cellSize,
      pixelMode
    );

    setMosaicUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return rendered.mosaicUrl;
    });
  }, [pixelVersion, gridDimensions, pixelMode]);

  const editPixelColor = useCallback(
    ({ row, col, color, pixelModeOverride }) => {
      const changed = paintPixel({
        row,
        col,
        color,
        pixelModeOverride,
        gridDimensions,
        pixelGridRef,
        editedPixelsRef,
        usageMapRef,
        ensureUsageEntry,
      });
      if (!changed) return false;
      syncUsageState();
      setPixelVersion((version) => version + 1);
      return true;
    },
    [ensureUsageEntry, gridDimensions, syncUsageState]
  );

  const erasePixelEdit = useCallback(
    ({ row, col }) => {
      const changed = erasePixel({
        row,
        col,
        gridDimensions,
        pixelGridRef,
        basePixelGridRef,
        editedPixelsRef,
        usageMapRef,
        ensureUsageEntry,
      });
      if (!changed) return false;
      syncUsageState();
      setPixelVersion((version) => version + 1);
      return true;
    },
    [ensureUsageEntry, gridDimensions, syncUsageState]
  );

  const resetAllEdits = useCallback(() => {
    const usageMap = resetAllEditsOnGrid({
      basePixelGridRef,
      pixelGridRef,
      editedPixelsRef,
      availablePalette,
      preparedCustomPalette,
    });
    if (!usageMap) return false;
    usageMapRef.current = usageMap;
    syncUsageState();
    setPixelVersion((version) => version + 1);
    return true;
  }, [availablePalette, preparedCustomPalette, syncUsageState]);

  const revertEditsForColor = useCallback(
    (colorId) => {
      const changed = erasePixelsByColorId({
        colorId,
        gridDimensions,
        pixelGridRef,
        basePixelGridRef,
        editedPixelsRef,
        usageMapRef,
        ensureUsageEntry,
      });
      if (!changed) return false;
      syncUsageState();
      setPixelVersion((version) => version + 1);
      return true;
    },
    [ensureUsageEntry, gridDimensions, syncUsageState]
  );

  return {
    mosaicUrl,
    imagePalette,
    customPaletteUsage,
    totalPixels,
    removePaletteColor,
    resetExcludedColors,
    isProcessing,
    error,
    gridDimensions,
    pixelGrid: pixelGridRef.current,
    editPixelColor,
    erasePixelEdit,
    resetAllEdits,
    revertEditsForColor,
  };
};

export default useMosaicEngine;
