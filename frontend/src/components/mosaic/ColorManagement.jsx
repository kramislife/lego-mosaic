import React from "react";
import {
  Brush,
  Pipette,
  Eraser,
  Download,
  RotateCcw,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingState from "@/components/layout/fallback/LoadingState";
import ErrorState from "@/components/layout/fallback/ErrorState";

const ColorManagement = ({
  tool,
  setTool,
  colors,
  colorsLoading,
  colorsError,
  activeColorId,
  setActiveColorId,
  customName,
  setCustomName,
  customHex,
  setCustomHex,
}) => {
  if (colorsLoading) {
    return (
      <LoadingState
        title="Color Management"
        message="Loading colors..."
        icon={Palette}
      />
    );
  }

  if (colorsError) {
    return (
      <ErrorState
        title="Error Loading Colors"
        message="Please refresh the page or try again later"
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Palette className="size-5 text-primary" />
          <CardTitle className="font-sans">Color Management</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-label="Reset colors"
          title="Reset colors"
        >
          <RotateCcw className="size-4" /> Reset all
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={tool === "paint" ? "destructive" : "outline"}
            onClick={() => setTool("paint")}
            className="grow justify-center"
          >
            <Brush className="size-4" /> Paint
          </Button>
          <Button
            type="button"
            variant={tool === "pick" ? "destructive" : "outline"}
            onClick={() => setTool("pick")}
            className="grow justify-center"
          >
            <Pipette className="size-4" /> Dropper
          </Button>
          <Button
            type="button"
            variant={tool === "erase" ? "destructive" : "outline"}
            onClick={() => setTool("erase")}
            className="grow justify-center"
          >
            <Eraser className="size-4" /> Eraser
          </Button>
          <Button
            type="button"
            variant="outline"
            className="grow justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div>
          <Label className="mb-3 text-muted-foreground">Available Colors</Label>
          <div className="flex flex-wrap gap-2">
            {colors?.map((color) => (
              <Button
                key={color.id}
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setActiveColorId(color.id)}
                aria-label={`${color.name} (${color.hex})`}
                title={`${color.name} (${color.hex})`}
                className={`size-6 ${
                  activeColorId === color.id
                    ? "ring-2 ring-primary"
                    : "hover:ring-2 hover:ring-accent"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-muted-foreground">Color name</Label>
            <Input
              id="custom-name"
              type="text"
              placeholder="Color name (e.g., Neon Pink)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-muted-foreground">Hex code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="custom-hex"
                type="text"
                placeholder="#RRGGBB"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
              />
              <Input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-15 p-1 cursor-pointer"
                title="Click to open color picker"
              />
            </div>
          </div>
          <Button variant="destructive" className="w-full">
            Add Custom Color
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorManagement;
