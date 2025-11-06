export function getCroppedImg(
  image,
  crop,
  { mime = "image/jpeg", quality = 0.92 } = {}
) {
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
