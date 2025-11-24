import { centerCrop, makeAspectCrop } from "react-image-crop";

export function getCenteredSquareCrop(imageWidth, imageHeight) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, imageWidth, imageHeight),
    imageWidth,
    imageHeight
  );
}

export function getCenteredAspectCrop(imageWidth, imageHeight, aspect) {
  const safeAspect = Math.max(0.05, aspect || 1);
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, safeAspect, imageWidth, imageHeight),
    imageWidth,
    imageHeight
  );
}

export default { getCenteredSquareCrop, getCenteredAspectCrop };
