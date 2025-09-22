import React from "react";
import { Image, Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const UploadImage = ({
  imageSrc,
  crop,
  setCrop,
  zoom,
  setZoom,
  fileInputRef,
  handleFileSelect,
  handleImageLoad,
  handleRemoveImage,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Image className="size-5 text-primary" />
        <CardTitle className="font-sans">Image Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {imageSrc ? (
          <div>
            {/* Image Attachment */}
            <ReactCrop crop={crop} onChange={setCrop} aspect={1} ruleOfThirds>
              <img
                src={imageSrc}
                alt="Selected"
                onLoad={handleImageLoad}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center",
                }}
              />
            </ReactCrop>

            {/* Zoom Slider */}
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <Label>Zoom</Label>
                <Badge variant="destructive">{zoom.toFixed(1)}x</Badge>
              </div>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                className="w-full"
              />
            </div>

            {/* Action Buttons - Cancel & Crop Image */}
            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                onClick={handleRemoveImage}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1">
                Crop Image
              </Button>
            </div>
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
