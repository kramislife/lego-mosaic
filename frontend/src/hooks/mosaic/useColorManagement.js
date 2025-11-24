import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { BRICKLINK_COLORS } from "@/constant/colorConfig";
import { isValidHex, validateColorName } from "@/utils/colors/colorValidator";
import { exportToCSV } from "@/utils/exporters/csvExporter";

export const useColorManagement = () => {
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

  const hasCustomColors = customColors.length > 0;

  const addCustomColor = useCallback(() => {
    const paletteForValidation = [...BRICKLINK_COLORS, ...customColors];
    const nameCheck = validateColorName(customName, paletteForValidation);
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
        id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: customName.trim(),
        hex: candidateHex,
      },
      ...customColors,
    ];
    persistCustomColors(next);
    setCustomName("");
    setCustomHex("");
    toast.success(`${customName || "Custom"} color added successfully`);
  }, [customName, customHex, customColors, persistCustomColors]);

  const deleteCustomColor = useCallback(
    (paletteId) => {
      const removed = customColors.find((c) => c.id === paletteId);
      const next = customColors.filter((c) => c.id !== paletteId);
      persistCustomColors(next);
      if (activeColorId === paletteId) {
        setActiveColorId(null);
      }
      toast.success(`${removed?.name || "Custom"} removed successfully`);
    },
    [customColors, persistCustomColors, activeColorId]
  );

  const [isDeleteCustomMode, setIsDeleteCustomMode] = useState(false);
  const toggleDeleteCustomMode = useCallback(() => {
    setIsDeleteCustomMode((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!activeColorId) {
      const fallback = customColors[0]?.id || BRICKLINK_COLORS[0]?.id || null;
      if (fallback) setActiveColorId(fallback);
    }
  }, [activeColorId, customColors]);

  const exportColorsToCSV = useCallback((colorsToExport) => {
      try {
      const exportList = Array.isArray(colorsToExport)
            ? colorsToExport
        : BRICKLINK_COLORS;
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
  }, []);

  return {
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    customColors,
    hasCustomColors,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    exportColorsToCSV,
  };
};

export default useColorManagement;
