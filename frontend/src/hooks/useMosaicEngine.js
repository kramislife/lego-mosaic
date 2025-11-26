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
  const [pixelVersion, setPixelVersion] = useState(0);
  const [gridDimensions, setGridDimensions] = useState({
    width: 0,
    height: 0,
    cellSize: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  });
  const usageMapRef = useRef(new Map());

  const requestRef = useRef(0);
  const timeoutRef = useRef(null);
  const sampleKeyRef = useRef(null);
  const rawDataRef = useRef(null);

  const preparedCustomPalette = useMemo(
    () => preparePalette(customColors.map((c) => ({ ...c, isCustom: true }))),
    [customColors]
  );

  const availablePalette = useMemo(() => {
    const excluded = new Set(excludedColorIds);
    const includeCustom = excluded.size > 0;
    const paletteEntries = includeCustom
      ? [...preparedCustomPalette, ...BASE_PALETTE]
      : BASE_PALETTE;
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

    const orderedCustom = preparedCustomPalette.map((customColor) => {
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
  }, [preparedCustomPalette]);

  const dependencies = useMemo(
    () => ({
      source,
      width,
      height,
      baseGrid,
      imageFilter,
      paletteVersion: availablePalette.map((entry) => entry.id).join("-"),
    }),
    [source, width, height, baseGrid, imageFilter, availablePalette]
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
        const builtInUsage = mapping.usage
          .filter((entry) => !entry.isCustom && entry.count > 0)
          .sort((a, b) => b.count - a.count);

        const customUsageMap = new Map(
          mapping.usage
            .filter((entry) => entry.isCustom)
            .map((entry) => [entry.id, entry])
        );

        usageMapRef.current = new Map();
        mapping.usage.forEach((entry) => {
          usageMapRef.current.set(entry.id, { ...entry });
        });
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
        setTotalPixels(rawData.width * rawData.height);
        pixelGridRef.current = mapping.mappedPixels;
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
  }, [dependencies, availablePalette, preparedCustomPalette]);

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
  };
};

export default useMosaicEngine;
