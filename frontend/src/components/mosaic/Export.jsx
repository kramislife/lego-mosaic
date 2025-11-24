import React from "react";
import { FileDown, ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Export = ({
  mosaicUrl,
  onDownloadImage,
  onDownloadInstructions,
  canExport = false,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <FileDown className="size-5 text-primary" />
        <CardTitle className="font-sans">Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-center gap-2"
            onClick={onDownloadImage}
            disabled={!canExport || !mosaicUrl}
          >
            <ImageDown className="size-4" /> Download Mosaic
          </Button>
          <Button
            variant="outline"
            className="justify-center gap-2"
            onClick={onDownloadInstructions}
            disabled={!canExport}
          >
            <FileDown className="size-4" /> Download Instructions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Export;
