import React from "react";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const UploadImage = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Image className="size-5 text-primary" />
        <CardTitle className="font-sans">Image Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-5 text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload />
          </div>
          <p className="font-sans text-lg text-primary">Drop your image here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Or click to browse files
          </p>
          <div className="mt-5">
            <Button variant="destructive">Choose Image</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadImage;
