import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { LEGO_COLORS } from "@/constant/colorConfig";
import { centerCrop, makeAspectCrop } from "react-image-crop";

export const useMosaic = () => {
  // ============================== Image Attachment ===============================
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Validate file type, accept only JPG, JPEG, PNG
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        !file.type.startsWith("image/") ||
        !["image/jpeg", "image/jpg", "image/png"].includes(file.type)
      ) {
        toast.error("Please select a valid image file (JPG, JPEG, PNG)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Default centered crop layout
  const getCenteredSquareCrop = useCallback((imageWidth, imageHeight) => {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 1, imageWidth, imageHeight),
      imageWidth,
      imageHeight
    );
  }, []);

  const handleImageLoad = useCallback(
    (event) => {
      const { width, height } = event.currentTarget;
      imageRef.current = event.currentTarget;
      const centered = getCenteredSquareCrop(width, height);
      setCrop(centered);
    },
    [getCenteredSquareCrop]
  );

  // Generate cropped image from current crop
  const getCroppedImg = useCallback((image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const targetWidth = Math.round(crop.width * scaleX);
    const targetHeight = Math.round(crop.height * scaleY);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      if (!ctx) {
        reject(new Error("2D canvas context is not available"));
        return;
      }

      try {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
          image,
          Math.round(crop.x * scaleX),
          Math.round(crop.y * scaleY),
          Math.round(crop.width * scaleX),
          Math.round(crop.height * scaleY),
          0,
          0,
          targetWidth,
          targetHeight
        );
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Failed to draw image to canvas")
        );
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to generate image blob from canvas"));
            return;
          }
          blob.name = fileName;
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        },
        "image/jpeg",
        0.92
      );
    });
  }, []);

  // Auto-generate cropped image when crop changes
  const onCropComplete = useCallback(
    async (crop) => {
      if (imageRef.current && crop.width && crop.height) {
        try {
          const croppedImageUrl = await getCroppedImg(
            imageRef.current,
            crop,
            "cropped-image.jpeg"
          );
          setCroppedImageUrl(croppedImageUrl);
        } catch (error) {
          console.error("Error generating cropped image:", error);
        }
      }
    },
    [getCroppedImg]
  );

  // Remove image when user click on cancel button
  const handleRemoveImage = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }
    setImageSrc(null);
    setCroppedImageUrl(null);
    setCrop({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageSrc, croppedImageUrl]);

  // =============================== Resolutions & Grid System ===============================
  const [baseGrid, setBaseGrid] = useState(16);
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);
  const min = baseGrid;
  const max = 128;
  const step = baseGrid;

  const cols = Math.max(1, Math.round(width / baseGrid));
  const rows = Math.max(1, Math.round(height / baseGrid));

  const allowedSizes = useMemo(() => {
    const sizes = [];
    for (let value = baseGrid; value <= 128; value += baseGrid)
      sizes.push(value);
    return sizes;
  }, [baseGrid]);

  const clampToAllowed = useCallback(
    (value) => {
      let nearest = allowedSizes[0];
      let minDiff = Math.abs(value - nearest);
      for (const size of allowedSizes) {
        const diff = Math.abs(value - size);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = size;
        }
      }
      return nearest;
    },
    [allowedSizes]
  );

  const onSelectBase = useCallback(
    (size) => {
      setBaseGrid(size);
      setWidth((prev) => clampToAllowed(prev));
      setHeight((prev) => clampToAllowed(prev));
    },
    [clampToAllowed]
  );

  // ===================================== Adjustments =======================================
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  // Generate CSS filter string from adjustment values
  const imageFilter = useMemo(() => {
    const filters = [];

    if (hue !== 0) {
      filters.push(`hue-rotate(${hue}deg)`);
    }

    if (saturation !== 0) {
      const saturationValue = 1 + saturation / 100;
      filters.push(`saturate(${saturationValue})`);
    }

    if (brightness !== 0) {
      // Map brightness from -100 to +100 to a range of 0.3 to 1.7
      const brightnessValue = 1 + (brightness / 100) * 0.7;
      filters.push(`brightness(${brightnessValue})`);
    }

    if (contrast !== 0) {
      // Map contrast from -100 to +100 to a range of 0.3 to 1.7
      const contrastValue = 1 + (contrast / 100) * 0.7;
      filters.push(`contrast(${contrastValue})`);
    }

    return filters.length > 0 ? filters.join(" ") : "none";
  }, [hue, saturation, brightness, contrast]);

  // =================================== Pixel Display Mode ==================================
  const [pixelMode, setPixelMode] = useState("square");

  // ==================================== Color Management ===================================

  const colors = useMemo(() => LEGO_COLORS, []);

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

  // Updates the in-memory custom colors state and saves it to localStorage
  const persistCustomColors = useCallback((next) => {
    setCustomColors(next);
    try {
      localStorage.setItem("customColors", JSON.stringify(next));
    } catch {}
  }, []);

  // Prioritize custom colors over default colors
  const paletteColors = useMemo(() => {
    return [
      ...customColors.map((c) => ({ ...c, isCustom: true })),
      ...colors.map((c) => ({ ...c, isCustom: false })),
    ];
  }, [colors, customColors]);

  // Flag for presence of any custom colors (for UI toggles)
  const hasCustomColors = customColors.length > 0;

  // built-in and custom colors
  const builtInColors = useMemo(
    () => paletteColors.filter((c) => !c.isCustom),
    [paletteColors]
  );
  const onlyCustomColors = useMemo(
    () => paletteColors.filter((c) => c.isCustom),
    [paletteColors]
  );
  const totalCount = paletteColors.length;
  const builtInCount = builtInColors.length;
  const customCount = onlyCustomColors.length;

  // Validate hex code
  const isValidHex = useCallback((hex) => /^#([0-9A-Fa-f]{6})$/.test(hex), []);

  // Add custom color
  const addCustomColor = useCallback(() => {
    const trimmedName = (customName || "").trim();
    const candidateHex = (customHex || "").trim();
    if (!trimmedName) {
      toast.error("Color name is required");
      return;
    }
    if (!candidateHex) {
      toast.error("Hex code is required");
      return;
    }
    if (!isValidHex(candidateHex)) {
      toast.error("Hex must be in #RRGGBB format");
      return;
    }
    const nameExists = paletteColors.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (nameExists) {
      toast.error("A color with this name already exists");
      return;
    }
    const next = [
      { id: `custom-${Date.now()}`, name: trimmedName, hex: candidateHex },
      ...customColors,
    ];
    persistCustomColors(next);
    setCustomName("");
    setCustomHex("");
    toast.success(`${trimmedName || "Custom"} color added successfully`);
  }, [
    customName,
    customHex,
    customColors,
    isValidHex,
    paletteColors,
    persistCustomColors,
  ]);

  // Delete custom color
  const deleteCustomColor = useCallback(
    (paletteId) => {
      const removed = customColors.find((c) => c.id === paletteId);
      const next = customColors.filter((c) => c.id !== paletteId);
      persistCustomColors(next);
      if (activeColorId === paletteId) {
        const fallbackId = next.length ? next[0].id : colors[0]?.id;
        if (fallbackId) setActiveColorId(fallbackId);
      }
      toast.success(`${removed?.name || "Custom"} removed successfully`);
    },
    [customColors, persistCustomColors, activeColorId, colors]
  );

  // Batch delete mode for custom colors
  const [isDeleteCustomMode, setIsDeleteCustomMode] = useState(false);
  const toggleDeleteCustomMode = useCallback(() => {
    setIsDeleteCustomMode((prev) => !prev);
  }, []);

  // Export colors to CSV (optionally accept a subset to export)
  const exportColorsToCSV = useCallback(
    (colorsToExport) => {
      try {
        // Prepare CSV data with all colors (custom + default)
        const exportList =
          Array.isArray(colorsToExport) && colorsToExport.length
            ? colorsToExport
            : paletteColors;
        const csvData = exportList.map((color) => ({
          color_name: color.name,
          hex_code: color.hex,
        }));

        // Convert to CSV format
        const headers = "Color Name,Hex Code\n";
        const csvContent =
          headers +
          csvData
            .map((row) => `"${row.color_name}","${row.hex_code}"`)
            .join("\n");

        // Create and download file
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "mosaic-colors.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error exporting colors:", error);
        toast.error("Failed to export colors");
      }
    },
    [paletteColors]
  );

  // ============================= Export Color Dialog State/Actions =============================
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState("all"); // all | custom | pick
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(paletteColors.map((c) => c.id))
  );

  // Reset selected IDs when palette changes
  useEffect(() => {
    setSelectedIds(new Set(paletteColors.map((c) => c.id)));
  }, [paletteColors]);

  const toggleId = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectGroup = useCallback((list, value) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const c of list) {
        if (value) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(
    () => setSelectedIds(new Set(paletteColors.map((c) => c.id))),
    [paletteColors]
  );
  const clearAll = useCallback(() => setSelectedIds(new Set()), []);

  const setMode = useCallback(
    (mode) => {
      setExportMode(mode);
      if (mode === "all") {
        selectAll();
      } else if (mode === "custom") {
        setSelectedIds(new Set(onlyCustomColors.map((c) => c.id)));
      }
    },
    [onlyCustomColors, selectAll]
  );

  // Guard: if no custom colors, do not allow staying on custom mode
  useEffect(() => {
    if (exportOpen && exportMode === "custom" && customCount === 0) {
      setMode("all");
    }
  }, [exportOpen, exportMode, customCount, setMode]);

  const handleConfirmExport = useCallback(() => {
    let toExport = paletteColors;
    if (exportMode === "custom") {
      toExport = onlyCustomColors;
    } else if (exportMode === "pick") {
      toExport = paletteColors.filter((c) => selectedIds.has(c.id));
    }
    exportColorsToCSV(toExport);
    setExportOpen(false);
  }, [
    exportMode,
    onlyCustomColors,
    paletteColors,
    selectedIds,
    exportColorsToCSV,
  ]);

  // Ensure first available color is set as the active color whenever the palette changes
  useEffect(() => {
    const firstId =
      (Array.isArray(paletteColors) && paletteColors[0]?.id) || undefined;
    if (firstId && activeColorId !== firstId) {
      setActiveColorId(firstId);
    }
  }, [paletteColors]);

  // ===================================== Return =====================================
  return {
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    croppedImageUrl,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    onCropComplete,
    handleRemoveImage,
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
    colors: paletteColors,
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
    addCustomColor,
    deleteCustomColor,
    isDeleteCustomMode,
    toggleDeleteCustomMode,
    hasCustomColors,
    exportColorsToCSV,
    imageFilter,
    // export color dialog props
    exportOpen,
    setExportOpen,
    exportMode,
    setExportMode: setMode,
    selectedIds,
    toggleId,
    selectGroup,
    selectAll,
    clearAll,
    builtInColors,
    customColors: onlyCustomColors,
    totalCount,
    builtInCount,
    customCount,
    handleConfirmExport,
  };
};

export default useMosaic;
