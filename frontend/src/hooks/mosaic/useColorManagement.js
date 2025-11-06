import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { LEGO_COLORS } from "@/constant/colorConfig";
import { isValidHex, validateColorName } from "@/utils/colors/colorValidator";
import {
  mergePalette,
  splitPalette,
  computeCounts,
} from "@/utils/colors/paletteMerge";
import { exportToCSV } from "@/utils/exporters/csvExporter";

export const useColorManagement = () => {
  const legoColors = useMemo(() => LEGO_COLORS, []);

  const [activeColorId, setActiveColorId] = useState(null);
  const [tool, setTool] = useState("paint");
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("");
  const [customColors, setCustomColors] = useState(() => {
    try {
      const raw = localStorage.getItem("customColors");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persistCustomColors = useCallback((next) => {
    setCustomColors(next);
    try {
      localStorage.setItem("customColors", JSON.stringify(next));
    } catch {}
  }, []);

  const paletteColors = useMemo(
    () => mergePalette(legoColors, customColors),
    [legoColors, customColors]
  );

  const { builtInColors, customColors: onlyCustomColors } = useMemo(
    () => splitPalette(paletteColors),
    [paletteColors]
  );

  const { totalCount, builtInCount, customCount } = useMemo(
    () => computeCounts(paletteColors),
    [paletteColors]
  );

  const hasCustomColors = customColors.length > 0;

  const addCustomColor = useCallback(() => {
    const nameCheck = validateColorName(customName, paletteColors);
    if (!nameCheck.ok) {
      toast.error(nameCheck.message || "Invalid name");
      return;
    }
    const candidateHex = (customHex || "").trim();
    if (!candidateHex) {
      toast.error("Hex code is required");
      return;
    }
    if (!isValidHex(candidateHex)) {
      toast.error("Hex must be in #RRGGBB format");
      return;
    }
    const next = [
      {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        hex: candidateHex,
      },
      ...customColors,
    ];
    persistCustomColors(next);
    setCustomName("");
    setCustomHex("");
    toast.success(`${customName || "Custom"} color added successfully`);
  }, [customName, customHex, customColors, paletteColors, persistCustomColors]);

  const deleteCustomColor = useCallback(
    (paletteId) => {
      const removed = customColors.find((c) => c.id === paletteId);
      const next = customColors.filter((c) => c.id !== paletteId);
      persistCustomColors(next);
      if (activeColorId === paletteId) {
        const fallbackId = next.length ? next[0].id : legoColors[0]?.id;
        if (fallbackId) setActiveColorId(fallbackId);
      }
      toast.success(`${removed?.name || "Custom"} removed successfully`);
    },
    [customColors, persistCustomColors, activeColorId, legoColors]
  );

  const [isDeleteCustomMode, setIsDeleteCustomMode] = useState(false);
  const toggleDeleteCustomMode = useCallback(() => {
    setIsDeleteCustomMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const firstId =
      (Array.isArray(paletteColors) && paletteColors[0]?.id) || undefined;
    if (firstId && activeColorId !== firstId) {
      setActiveColorId(firstId);
    }
  }, [paletteColors]);

  const exportColorsToCSV = useCallback(
    (colorsToExport) => {
      try {
        const exportList =
          Array.isArray(colorsToExport) && colorsToExport.length
            ? colorsToExport
            : paletteColors;
        exportToCSV({
          filename: "mosaic-colors.csv",
          headers: ["Color Name", "Hex Code"],
          rows: exportList.map((c) => ({
            "Color Name": c.name,
            "Hex Code": c.hex,
          })),
        });
        toast.success("Colors exported successfully");
      } catch (error) {
        console.error("Error exporting colors:", error);
        toast.error("Failed to export colors");
      }
    },
    [paletteColors]
  );

  return {
    // palette
    colors: paletteColors,
    builtInColors,
    customColors: onlyCustomColors,
    totalCount,
    builtInCount,
    customCount,
    hasCustomColors,
    // selection & tools
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    // custom color form
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    addCustomColor,
    deleteCustomColor,
    // delete mode
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    // export
    exportColorsToCSV,
  };
};

export default useColorManagement;
