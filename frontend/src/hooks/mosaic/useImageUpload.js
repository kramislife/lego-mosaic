import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { validateImageFile } from "@/utils/image/imageValidator";
import { getCenteredAspectCrop } from "@/utils/image/cropHelper";
import { getCroppedImg as cropImage } from "@/utils/image/imageCropper";

export const useImageUpload = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const aspectRef = useRef(1);

  const replaceCroppedUrl = useCallback((nextUrl) => {
    setCroppedImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl || null;
    });
  }, []);

  const generateCroppedPreview = useCallback(
    async (nextCrop) => {
      if (!imageRef.current || !nextCrop?.width || !nextCrop?.height) {
        replaceCroppedUrl(null);
        return;
      }

      try {
        const cropped = await cropImage(imageRef.current, nextCrop, {
          mime: "image/png",
          quality: 0.95,
        });
        replaceCroppedUrl(cropped);
      } catch (error) {
        console.error("Error generating cropped image:", error);
      }
    },
    [replaceCroppedUrl]
  );

  const alignCropToAspect = useCallback(
    (aspect) => {
      const nextAspect = aspect && aspect > 0 ? aspect : 1;
      aspectRef.current = nextAspect;

      const image = imageRef.current;
      if (!image) return;

      const imageWidth = image.naturalWidth || image.width;
      const imageHeight = image.naturalHeight || image.height;
      if (!imageWidth || !imageHeight) return;

      const alignedCrop = getCenteredAspectCrop(
        imageWidth,
        imageHeight,
        nextAspect
      );
      setCrop(alignedCrop);
      generateCroppedPreview(alignedCrop);
    },
    [generateCroppedPreview]
  );

  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const { ok, message } = validateImageFile(file);
        if (!ok) {
          toast.error(message || "Invalid file");
          return;
        }

        replaceCroppedUrl(null);

        const reader = new FileReader();
        reader.onload = (e) => {
          setImageSrc(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [replaceCroppedUrl]
  );

  const handleImageLoad = useCallback(
    (event) => {
      imageRef.current = event.currentTarget;
      alignCropToAspect(aspectRef.current);
    },
    [alignCropToAspect]
  );

  const onCropComplete = useCallback(
    async (nextCrop) => {
      generateCroppedPreview(nextCrop);
    },
    [generateCroppedPreview]
  );

  const handleRemoveImage = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    replaceCroppedUrl(null);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imageSrc, replaceCroppedUrl]);

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
    alignCropToAspect,
  };
};

export default useImageUpload;
