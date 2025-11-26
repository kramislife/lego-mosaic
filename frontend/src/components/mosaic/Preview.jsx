import React from "react";
import { Loader2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Preview = ({
  croppedImageUrl,
  mosaicImageUrl,
  imageFilter,
  isGenerating,
  isExpanded = false,
}) => {
  const hasMosaic = Boolean(mosaicImageUrl);
  const hasOriginal = Boolean(croppedImageUrl);

  const displaySrc = hasMosaic ? mosaicImageUrl : hasOriginal ? croppedImageUrl : null;
  const displayAlt = hasMosaic ? "Mosaic preview" : "Cropped image preview";
  const displayStyle = hasMosaic ? undefined : { filter: imageFilter };
  const showLoader = isGenerating && !hasMosaic;

  const containerClass = isExpanded
    ? "w-full"
    : "sticky top-22 h-[calc(100vh-90px)]";

  const cardClass = isExpanded
    ? "p-0 rounded-none w-full"
    : "p-0 rounded-none h-full";

  const contentClass = isExpanded
    ? "relative w-full flex items-center justify-center p-4"
    : "relative h-full flex items-center justify-center p-2";

  const imageContainerClass = isExpanded
    ? "relative w-full"
    : "relative w-full h-full";

  const imageClass = isExpanded
    ? "w-full h-auto object-contain max-w-full"
    : "w-full h-full object-contain";


  return (
    <div className={containerClass}>
      <Card className={cardClass}>
        <CardContent className={contentClass}>
          {displaySrc ? (
            <div className={imageContainerClass}>
              <img
                src={displaySrc}
                alt={displayAlt}
                className={imageClass}
                style={displayStyle}
              />

              {showLoader && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="mx-auto mb-3 size-10" />
              <p className="text-lg font-semibold">Upload an image to get started</p>
              <p className="text-sm">Your LEGO mosaic will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;
