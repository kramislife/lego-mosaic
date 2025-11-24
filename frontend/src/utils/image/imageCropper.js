export function getCroppedImg(
  image,
  crop,
  { mime = "image/jpeg", quality = 0.92 } = {}
) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const unit = crop.unit || "px";
  const isPercent = unit === "%";

  const cropX = isPercent ? (crop.x / 100) * image.width : crop.x;
  const cropY = isPercent ? (crop.y / 100) * image.height : crop.y;
  const cropWidth = isPercent ? (crop.width / 100) * image.width : crop.width;
  const cropHeight = isPercent ? (crop.height / 100) * image.height : crop.height;

  const targetWidth = Math.max(1, Math.round(cropWidth * scaleX));
  const targetHeight = Math.max(1, Math.round(cropHeight * scaleY));
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
        Math.round(cropX * scaleX),
        Math.round(cropY * scaleY),
        targetWidth,
        targetHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );
    } catch (err) {
      reject(
        err instanceof Error ? err : new Error("Failed to draw image to canvas")
      );
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to generate image blob from canvas"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      },
      mime,
      quality
    );
  });
}

export default { getCroppedImg };
