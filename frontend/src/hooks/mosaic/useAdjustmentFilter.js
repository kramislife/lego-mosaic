import { useMemo, useState } from "react";
import { generateFilterFromAdjustments } from "@/utils/adjustment/adjustmentFilter";

export const useAdjustmentFilter = () => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const imageFilter = useMemo(() => {
    return generateFilterFromAdjustments({
      hue,
      saturation,
      brightness,
      contrast,
    });
  }, [hue, saturation, brightness, contrast]);

  return {
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    imageFilter,
  };
};

export default useAdjustmentFilter;
