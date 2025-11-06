import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { validateImageFile } from "@/utils/image/imageValidator";
import { getCenteredSquareCrop } from "@/utils/image/cropHelper";
import { getCroppedImg as cropImage } from "@/utils/image/imageCropper";

export const useImageUpload = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      const { ok, message } = validateImageFile(file);
      if (!ok) {
        toast.error(message || "Invalid file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageLoad = useCallback((event) => {
    const { width, height } = event.currentTarget;
    imageRef.current = event.currentTarget;
    const centered = getCenteredSquareCrop(width, height);
    setCrop(centered);
  }, []);

  const onCropComplete = useCallback(async (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      try {
        const croppedImage = await cropImage(imageRef.current, crop, {
          mime: "image/jpeg",
          quality: 0.92,
        });
        setCroppedImageUrl(croppedImage);
      } catch (error) {
        console.error("Error generating cropped image:", error);
      }
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
    setImageSrc(null);
    setCroppedImageUrl(null);
    setCrop({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imageSrc, croppedImageUrl]);

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
  };
};

export default useImageUpload;
