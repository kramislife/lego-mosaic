import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PIXEL_MODES } from "@/constant/pixelConfig";

const Preview = ({
  croppedImageUrl,
  mosaicImageUrl,
  imageFilter,
  isGenerating,
  isExpanded = false,
  gridDimensions = {},
  pixelMode,
  onPixelClick,
  tool,
  activeColorHex,
  pixelGrid,
  availableColors = [],
}) => {
  const hasMosaic = Boolean(mosaicImageUrl);
  const hasOriginal = Boolean(croppedImageUrl);

  const displaySrc = hasMosaic ? mosaicImageUrl : hasOriginal ? croppedImageUrl : null;
  const displayAlt = hasMosaic ? "Mosaic preview" : "Cropped image preview";
  const displayStyle = hasMosaic ? undefined : { filter: imageFilter };
  const showLoader = isGenerating && !hasMosaic;

  const containerClass = isExpanded
    ? "w-full"
    : "sticky top-22 h-[calc(100vh-90px)]";

  const cardClass = isExpanded
    ? "p-0 rounded-none w-full"
    : "p-0 rounded-none h-full";

  const contentClass = isExpanded
    ? "relative w-full flex items-center justify-center p-4"
    : "relative h-full flex items-center justify-center p-2";

  const imageContainerClass = isExpanded
    ? "relative w-full"
    : "relative w-full h-full";

  const imageClass = isExpanded
    ? "w-full h-auto object-contain max-w-full"
    : "w-full h-full object-contain";

  const containerRef = useRef(null);
  const hoverCanvasRef = useRef(null);
  const lastHoverRef = useRef({ row: null, col: null });

  const [cursorInfo, setCursorInfo] = useState(null);

  // Drag-painting state
  const [isPainting, setIsPainting] = useState(false);
  const lastPaintKeyRef = useRef(null);

  const canShowHoverIndicator = useMemo(() => {
    if (!hasMosaic) return false;
    if (!gridDimensions || !gridDimensions.width || !gridDimensions.height) {
      return false;
    }
    const supportedModes = new Set([
      PIXEL_MODES.ROUND_PLATE,
      PIXEL_MODES.SQUARE_PLATE,
      PIXEL_MODES.ROUND_TILE,
      PIXEL_MODES.SQUARE_TILE,
    ]);
    return supportedModes.has(pixelMode);
  }, [gridDimensions, hasMosaic, pixelMode]);

  const clearHoverCanvas = useCallback(() => {
    const canvas = hoverCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastHoverRef.current = { row: null, col: null };
  }, []);

  const drawHoverCircle = useCallback(
    (row, col) => {
      if (!gridDimensions?.cellSize) return;
      const canvas = hoverCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cellSize = gridDimensions.cellSize;
      const cx = col * cellSize + cellSize / 2;
      const cy = row * cellSize + cellSize / 2;
      const innerRadius = (cellSize / 2) * 0.55;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      lastHoverRef.current = { row, col };
    },
    [gridDimensions]
  );

  const handleMouseLeave = useCallback(() => {
    clearHoverCanvas();
    setIsPainting(false);
    lastPaintKeyRef.current = null;
    setCursorInfo(null);
  }, [clearHoverCanvas]);

  const getGridPosition = useCallback(
    (eventLike) => {
      // eventLike: MouseEvent or Touch
      const event = "clientX" in eventLike ? eventLike : eventLike?.touches?.[0];
      if (!event) return null;

      if (!canShowHoverIndicator || !gridDimensions) {
        return null;
      }

      const container = containerRef.current;
      if (!container) return null;

      const {
        width: gridWidth,
        height: gridHeight,
        canvasWidth,
        canvasHeight,
      } = gridDimensions;

      if (!gridWidth || !gridHeight || !canvasWidth || !canvasHeight) {
        return null;
      }

      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      if (!containerWidth || !containerHeight) {
        return null;
      }

      const scale = Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight);
      if (!Number.isFinite(scale) || scale <= 0) {
        return null;
      }

      const displayWidth = canvasWidth * scale;
      const displayHeight = canvasHeight * scale;
      const offsetX = (containerWidth - displayWidth) / 2;
      const offsetY = (containerHeight - displayHeight) / 2;

      const relativeX = event.clientX - rect.left - offsetX;
      const relativeY = event.clientY - rect.top - offsetY;

      if (
        relativeX < 0 ||
        relativeY < 0 ||
        relativeX > displayWidth ||
        relativeY > displayHeight
      ) {
        return null;
      }

      const cellWidth = displayWidth / gridWidth;
      const cellHeight = displayHeight / gridHeight;
      const col = Math.floor(relativeX / cellWidth);
      const row = Math.floor(relativeY / cellHeight);

      return { row, col, key: `${row}:${col}` };
    },
    [canShowHoverIndicator, gridDimensions]
  );

  const handleMouseMove = useCallback(
    (event) => {
      const coords = getGridPosition(event);
      if (!coords) {
        clearHoverCanvas();
        if (cursorInfo) setCursorInfo(null);
        return;
      }

      // Hover indicator
      const { row: prevRow, col: prevCol } = lastHoverRef.current;
      if (prevRow !== coords.row || prevCol !== coords.col) {
        drawHoverCircle(coords.row, coords.col);
      }

      // Update cursor indicator position for dropper / eraser
      if (tool === "pick" || tool === "erase") {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          if (tool === "pick") {
            const { width: gridWidth, height: gridHeight } =
              gridDimensions || {};
            let hoverHex = activeColorHex || "#000000";
            let hoverName = null;
            if (
              Array.isArray(pixelGrid) &&
              gridWidth &&
              gridHeight &&
              coords.row >= 0 &&
              coords.row < gridHeight &&
              coords.col >= 0 &&
              coords.col < gridWidth
            ) {
              const index = coords.row * gridWidth + coords.col;
              const pixel = pixelGrid[index];
              if (pixel?.hex) {
                hoverHex = pixel.hex;
              }
              if (pixel?.colorId && Array.isArray(availableColors)) {
                const found = availableColors.find(
                  (c) => c.id === pixel.colorId
                );
                hoverName = found?.name ?? pixel.name ?? null;
              }
            }
            setCursorInfo({
              mode: "pick",
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              hex: hoverHex,
              name: hoverName,
            });
          } else {
            setCursorInfo({
              mode: "erase",
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        }
      } else if (cursorInfo) {
        setCursorInfo(null);
      }

      // Drag-painting
      if (isPainting && typeof onPixelClick === "function") {
        if (coords.key !== lastPaintKeyRef.current) {
          lastPaintKeyRef.current = coords.key;
          onPixelClick({ row: coords.row, col: coords.col });
        }
      }
    },
    [
      clearHoverCanvas,
      drawHoverCircle,
      getGridPosition,
      isPainting,
      onPixelClick,
      tool,
      cursorInfo,
      gridDimensions,
      pixelGrid,
      activeColorHex,
      availableColors,
    ]
  );

  const handleMouseDown = useCallback(
    (event) => {
      const coords = getGridPosition(event);
      if (!coords || typeof onPixelClick !== "function") return;
      setIsPainting(true);
      lastPaintKeyRef.current = coords.key;
      onPixelClick({ row: coords.row, col: coords.col });
    },
    [getGridPosition, onPixelClick]
  );

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
    lastPaintKeyRef.current = null;
  }, []);

  // Touch support
  const handleTouchStart = useCallback(
    (e) => {
      const touch = e.touches?.[0];
      if (!touch) return;
      const coords = getGridPosition(touch);
      if (!coords || typeof onPixelClick !== "function") return;
      setIsPainting(true);
      lastPaintKeyRef.current = coords.key;
      onPixelClick({ row: coords.row, col: coords.col });
    },
    [getGridPosition, onPixelClick]
  );

  const handleTouchMove = useCallback(
    (e) => {
      const touch = e.touches?.[0];
      if (!touch) return;
      const coords = getGridPosition(touch);
      if (!coords) return;

      // Update hover for consistency (optional on mobile)
      const { row: prevRow, col: prevCol } = lastHoverRef.current;
      if (prevRow !== coords.row || prevCol !== coords.col) {
        drawHoverCircle(coords.row, coords.col);
      }

      if (isPainting && typeof onPixelClick === "function") {
        if (coords.key !== lastPaintKeyRef.current) {
          lastPaintKeyRef.current = coords.key;
          onPixelClick({ row: coords.row, col: coords.col });
        }
      }
    },
    [drawHoverCircle, getGridPosition, isPainting, onPixelClick]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPainting(false);
    lastPaintKeyRef.current = null;
    // Keep or clear hover canvas; clearing avoids stale highlight
    clearHoverCanvas();
  }, [clearHoverCanvas]);

  useEffect(() => {
    if (!canShowHoverIndicator) {
      clearHoverCanvas();
    }
  }, [canShowHoverIndicator, clearHoverCanvas]);

  const shouldRenderHoverCanvas =
    canShowHoverIndicator &&
    gridDimensions?.canvasWidth &&
    gridDimensions?.canvasHeight &&
    gridDimensions?.cellSize;

  return (
    <div className={containerClass}>
      <Card className={cardClass}>
        <CardContent className={contentClass}>
          {displaySrc ? (
            <div
              ref={containerRef}
              className={`${imageContainerClass} ${canShowHoverIndicator ? "cursor-default select-none" : "select-none"}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={displaySrc}
                alt={displayAlt}
                className={imageClass}
                style={displayStyle}
                draggable={false}
              />

              {shouldRenderHoverCanvas && (
                <canvas
                  ref={hoverCanvasRef}
                  width={gridDimensions.canvasWidth}
                  height={gridDimensions.canvasHeight}
                  className="pointer-events-none absolute inset-0 w-full h-full object-contain"
                />
              )}

              {cursorInfo && (
                <div
                  className="pointer-events-none absolute z-20 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs shadow-sm border"
                  style={{
                    left: cursorInfo.x + 12,
                    top: cursorInfo.y + 12,
                  }}
                >
                  {cursorInfo.mode === "pick" ? (
                    <>
                      <span
                        className="inline-block size-3 rounded-sm border"
                        style={{ backgroundColor: cursorInfo.hex || "#000000" }}
                      />
                      <span>{cursorInfo.name || "Dropper"}</span>
                    </>
                  ) : (
                    <span>Eraser</span>
                  )}
                </div>
              )}

              {showLoader && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="mx-auto mb-3 size-10" />
              <p className="text-lg font-semibold">Upload an image to get started</p>
              <p className="text-sm">Your LEGO mosaic will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;
