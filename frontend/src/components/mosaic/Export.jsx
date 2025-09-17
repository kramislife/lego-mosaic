import React from "react";
import { FileDown, ImageDown, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Export = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <FileDown className="size-5 text-primary" />
        <CardTitle className="font-sans">Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="justify-center gap-2">
            <ImageDown className="size-4" /> PNG
          </Button>
          <Button variant="outline" className="justify-center gap-2">
            <FileDown className="size-4" /> PDF
          </Button>
          <Button variant="outline" className="justify-center gap-2">
            <FileText className="size-4" /> XML
          </Button>
          <Button variant="outline" className="justify-center gap-2">
            <FileSpreadsheet className="size-4" /> CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Export;
