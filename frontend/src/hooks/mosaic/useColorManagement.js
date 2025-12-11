import {  useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { BRICKLINK_COLORS } from "@/constant/colorConfig";
import { isValidHex, validateColorName } from "@/utils/colors/colorValidator";
import { exportToCSV } from "@/utils/exporters/csvExporter";
import { importColorsFromFile } from "@/utils/importers/colorFileImporter";

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

  const [importedColors, setImportedColors] = useState([]);

  // Robust ID generator to avoid collisions during batch imports
  const generateId = useCallback((prefix, extra = "") => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    const now = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    return extra ? `${prefix}-${now}-${extra}-${rand}` : `${prefix}-${now}-${rand}`;
  }, []);

  const persistCustomColors = useCallback((next) => {
    setCustomColors(next);
    try {
      localStorage.setItem("customColors", JSON.stringify(next));
    } catch {}
  }, []);

  // Merge custom colors (persisted) with imported colors (temporary)
  const [allCustomColors, setAllCustomColors] = useState(() => [
    ...importedColors,
    ...customColors,
  ]);

  // Keep merged list in sync so UI/engine always see both sources together
  useEffect(() => {
    setAllCustomColors([...importedColors, ...customColors]);
  }, [importedColors, customColors]);

  const hasCustomColors = allCustomColors.length > 0;

  const addCustomColor = useCallback(() => {
    const paletteForValidation = allCustomColors;
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

    const newColor = {
      id: generateId("custom"),
      name: customName.trim(),
      hex: candidateHex,
    };

    // Persisted list (localStorage) should include existing persisted colors + the new one
    const nextPersisted = [newColor, ...customColors];
    persistCustomColors(nextPersisted);

    // Keep merged list (persisted + imported) in sync for consumers
    setAllCustomColors([...importedColors, ...nextPersisted]);
    setCustomName("");
    setCustomHex("");
    toast.success(`${customName || "Custom"} color added successfully`);
  }, [
    customName,
    customHex,
    customColors,
    importedColors,
    allCustomColors,
    persistCustomColors,
    generateId,
  ]);

  const deleteCustomColor = useCallback(
    (paletteId) => {
      // Check if it's in imported colors (temporary) or custom colors (persisted)
      const inImported = importedColors.find((c) => c.id === paletteId);
      const inCustom = customColors.find((c) => c.id === paletteId);
      const removed = inImported || inCustom;

      if (inImported) {
        // Remove from imported colors (temporary)
        setImportedColors((prev) => prev.filter((c) => c.id !== paletteId));
      } else if (inCustom) {
        // Remove from custom colors (persisted)
        const next = customColors.filter((c) => c.id !== paletteId);
        persistCustomColors(next);
      }

      if (activeColorId === paletteId) {
        setActiveColorId(null);
      }
      toast.success(`${removed?.name || "Custom"} removed successfully`);
    },
    [customColors, importedColors, persistCustomColors, activeColorId]
  );

  const [isDeleteCustomMode, setIsDeleteCustomMode] = useState(false);
  const toggleDeleteCustomMode = useCallback(() => {
    setIsDeleteCustomMode((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!activeColorId) {
      const fallback = allCustomColors[0]?.id || BRICKLINK_COLORS[0]?.id || null;
      if (fallback) setActiveColorId(fallback);
    }
  }, [activeColorId, allCustomColors]);

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

  const importColorsFromFileHandler = useCallback(
    async (file, imagePalette = []) => {
      try {
        const colorsFromFile = await importColorsFromFile(file);
        
        if (colorsFromFile.length === 0) {
          toast.error("No valid colors found in file");
          return;
        }

        // Check for duplicates against existing custom colors (both persisted and imported) and image colors
        const allExistingColorNames = new Set(
          allCustomColors.map((c) => c.name.toLowerCase())
        );
        const imageColorNames = new Set(
          (imagePalette || []).map((c) => c.name.toLowerCase())
        );

        const newColors = [];
        const skippedInCustom = [];
        const skippedInImage = [];
        const skippedInvalid = [];

        for (let i = 0; i < colorsFromFile.length; i++) {
          const color = colorsFromFile[i];
          const colorNameLower = color.name.toLowerCase();
          
          // Check if exists in image colors
          if (imageColorNames.has(colorNameLower)) {
            skippedInImage.push(color.name);
            continue;
          }

          // Check if exists in custom colors (persisted or imported)
          if (allExistingColorNames.has(colorNameLower)) {
            skippedInCustom.push(color.name);
            continue;
          }

          // Validate hex format
          if (!isValidHex(color.hex)) {
            skippedInvalid.push(color.name);
            continue;
          }

          newColors.push({
            id: generateId("imported", i),
            name: color.name,
            hex: color.hex,
          });
          allExistingColorNames.add(colorNameLower);
        }

        // Show specific messages for colors that exist in image colors

        if (newColors.length === 0) {
          const totalSkipped = skippedInImage.length + skippedInCustom.length + skippedInvalid.length;
          if (totalSkipped > 0) {
            const reasons = [];
            if (skippedInImage.length > 0) reasons.push(`${skippedInImage.length} in image colors`);
            if (skippedInCustom.length > 0) reasons.push(`${skippedInCustom.length} duplicates`);
            if (skippedInvalid.length > 0) reasons.push(`${skippedInvalid.length} invalid`);
            toast.warning(
              `All colors skipped (${reasons.join(", ")})`
            );
          } else {
            toast.warning("No new colors to add");
          }
          return;
        }

        // Add new colors to imported colors (temporary, not persisted)
        setImportedColors((prev) => [...newColors, ...prev]);

        const skippedMessages = [];
        if (skippedInImage.length > 0) skippedMessages.push(`${skippedInImage.length} image colors`);
        if (skippedInCustom.length > 0) skippedMessages.push(`${skippedInCustom.length} duplicates`);
        if (skippedInvalid.length > 0) skippedMessages.push(`${skippedInvalid.length} invalid`);

        const message =
          skippedMessages.length > 0
            ? `${newColors.length} color(s) added, ${skippedMessages.join(", ")} skipped`
            : `${newColors.length} color(s) added successfully`;
        toast.success(message);
      } catch (error) {
        console.error("Error importing colors:", error);
        toast.error(error.message || "Failed to import colors from file");
      }
    },
    [allCustomColors, importedColors, persistCustomColors, generateId]
  );

  return {
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    customColors: allCustomColors, // Return merged list (imported + persisted)
    hasCustomColors,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    exportColorsToCSV,
    importColorsFromFile: importColorsFromFileHandler,
  };
};

export default useColorManagement;
