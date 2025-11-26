// Triggers a download of the generated mosaic image as a PNG file.

export const downloadMosaicPNG = ({ mosaicUrl, width, height }) => {
  if (!mosaicUrl) {
    throw new Error(
      "Mosaic image is not available. Please generate the mosaic first."
    );
  }

  const safeWidth = Number.isFinite(width) && width > 0 ? width : "custom";
  const safeHeight = Number.isFinite(height) && height > 0 ? height : "custom";
  const filename = `LEGO-Mosaic(${safeWidth}x${safeHeight}).png`;

  const link = document.createElement("a");
  link.href = mosaicUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
