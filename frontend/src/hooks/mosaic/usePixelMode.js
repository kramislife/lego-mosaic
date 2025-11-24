import { useState } from "react";
import { PIXEL_MODES } from "@/constant/pixelConfig";

export const usePixelMode = () => {
  const [pixelMode, setPixelMode] = useState(PIXEL_MODES.ROUND_TILE);
  return { pixelMode, setPixelMode };
};

export default usePixelMode;
