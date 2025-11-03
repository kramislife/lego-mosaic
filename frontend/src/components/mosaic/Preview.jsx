import React from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Preview = ({ croppedImageUrl, imageFilter }) => {
  return (
    <div className="sticky top-22">
      <Card className="p-2 rounded-none">
        <CardContent className="min-h-[90vh] flex items-center justify-center p-2">
          {croppedImageUrl ? (
            <div className="w-full h-full">
              <img
                src={croppedImageUrl}
                alt="Cropped image preview"
                className="w-full h-full object-cover"
                style={{ filter: imageFilter }}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="mx-auto mb-3 size-10" />
              <p className="text-lg font-semibold">
                Upload an image to get started
              </p>
              <p className="text-sm">Your LEGO mosaic will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;
