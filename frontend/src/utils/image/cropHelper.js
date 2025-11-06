import { centerCrop, makeAspectCrop } from "react-image-crop";

export function getCenteredSquareCrop(imageWidth, imageHeight) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, imageWidth, imageHeight),
    imageWidth,
    imageHeight
  );
}

export default { getCenteredSquareCrop };
