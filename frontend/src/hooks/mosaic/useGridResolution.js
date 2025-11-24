import { useMemo, useState, useCallback } from "react";
import {
  getAllowedSizes,
  getGridDimensions,
  DEFAULT_MAX_GRID,
  DEFAULT_BASE_GRID,
} from "@/utils/grid/gridCalculator";
import { clampToAllowed as clampToAllowedUtil } from "@/utils/grid/gridSizeClamp";

export const useGridResolution = () => {
  const [baseGrid, setBaseGrid] = useState(DEFAULT_BASE_GRID);
  const [width, setWidth] = useState(DEFAULT_BASE_GRID);
  const [height, setHeight] = useState(DEFAULT_BASE_GRID);

  const min = baseGrid;
  const max = DEFAULT_MAX_GRID;
  const step = baseGrid;

  const { cols, rows } = getGridDimensions(width, height, baseGrid);

  const allowedSizes = useMemo(
    () => getAllowedSizes(baseGrid, max),
    [baseGrid, max]
  );

  const clampToAllowed = useCallback(
    (value) => clampToAllowedUtil(value, allowedSizes),
    [allowedSizes]
  );

  const onSelectBase = useCallback(
    (size) => {
      setBaseGrid(size);
      setWidth(size);
      setHeight(size);
    },
    []
  );

  return {
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
  };
};

export default useGridResolution;
