import React from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Preview = () => {
  return (
    <div className="sticky top-22">
      <Card>
        <CardContent className="min-h-[90vh] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Upload className="mx-auto mb-3 size-10" />
            <p className="text-lg font-semibold">
              Upload an image to get started
            </p>
            <p className="text-sm">Your LEGO mosaic will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;
