import React from "react";
import { Image, Upload, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const UploadImage = ({
  imageSrc,
  crop,
  setCrop,
  fileInputRef,
  handleFileSelect,
  handleImageLoad,
  onCropComplete,
  handleRemoveImage,
}) => {
  return (
    <Card className="gap-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Image className="size-5 text-primary" />
          <CardTitle className="font-sans">Image Settings</CardTitle>
        </div>
        {imageSrc && (
          <Button
            variant="ghost"
            onClick={handleRemoveImage}
            className="p-0 hover:text-destructive hover:bg-transparent"
            title="Remove image"
          >
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {imageSrc ? (
          <div>
            {/* Image Attachment */}
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={onCropComplete}
              aspect={1}
              ruleOfThirds
            >
              <img src={imageSrc} alt="Selected" onLoad={handleImageLoad} />
            </ReactCrop>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-5 text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload />
            </div>
            <p className="font-sans text-lg text-primary">Choose your image</p>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, JPEG, PNG supported
            </p>
            <div className="mt-5">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="destructive"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Image
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadImage;
