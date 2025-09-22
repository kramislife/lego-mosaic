import { useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useGetColorsQuery } from "@/redux/api/colorApi";
import { centerCrop, makeAspectCrop } from "react-image-crop";

export const useMosaic = () => {
  // ============================== Image Attachment ===============================
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef(null);

  // validate file type, accept only JPG, JPEG, PNG
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
      const centered = getCenteredSquareCrop(width, height);
      setCrop(centered);
    },
    [getCenteredSquareCrop]
  );

  // remove image when user click on cancel button
  const handleRemoveImage = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageSrc]);

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

  // =================================== Pixel Display Mode ==================================
  const [pixelMode, setPixelMode] = useState("square");

  // ==================================== Color Management ===================================

  // get colors via api from mocsupply.com
  const {
    data: colorsData,
    isLoading: colorsLoading,
    error: colorsError,
  } = useGetColorsQuery();

  const colors = useMemo(() => {
    return (
      colorsData?.colors?.map((color) => ({
        id: color._id,
        name: color.color_name,
        hex: color.hex_code,
      })) || []
    );
  }, [colorsData]);

  const [activeColorId, setActiveColorId] = useState(colors?.[0]?.id);
  const [tool, setTool] = useState("paint");
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#000000");

  return {
    // image attachment
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    handleRemoveImage,

    // dimensions & grid
    baseGrid,
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

    // adjustments
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,

    // pixel mode
    pixelMode,
    setPixelMode,

    // color management
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
  };
};

export default useMosaic;
