import React from "react";
import {
  Brush,
  Pipette,
  Eraser,
  Download,
  RotateCcw,
  Palette,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  addCustomColor,
  deleteCustomColor,
  isDeleteCustomMode,
  toggleDeleteCustomMode,
  hasCustomColors,
  exportColorsToCSV,
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

        {/* Reset colors */}
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
          {/* Paint */}
          <Button
            type="button"
            variant={tool === "paint" ? "destructive" : "outline"}
            onClick={() => setTool("paint")}
            className="grow justify-center"
          >
            <Brush className="size-4" /> Paint
          </Button>

          {/* Dropper */}
          <Button
            type="button"
            variant={tool === "pick" ? "destructive" : "outline"}
            onClick={() => setTool("pick")}
            className="grow justify-center"
          >
            <Pipette className="size-4" /> Dropper
          </Button>

          {/* Eraser */}
          <Button
            type="button"
            variant={tool === "erase" ? "destructive" : "outline"}
            onClick={() => setTool("erase")}
            className="grow justify-center"
          >
            <Eraser className="size-4" /> Eraser
          </Button>

          {/* Export CSV */}
          <Button
            type="button"
            variant="outline"
            className="grow justify-center gap-2"
            onClick={exportColorsToCSV}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="space-y-3">
          <Label>Available Colors</Label>

          {/* If trash button is clicked, display X, otherwise display badge */}
          <div className="flex flex-wrap gap-1">
            {colors?.map((color) => (
              <div key={color.id} className="relative">
                {color.isCustom &&
                  (isDeleteCustomMode ? (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomColor(color.id);
                      }}
                      className="absolute -top-1 -right-1 size-4 p-0 rounded-full text-destructive leading-none cursor-pointer"
                      title="Delete custom color"
                    >
                      ×
                    </Button>
                  ) : (
                    <Badge
                      className="absolute bottom-5.5 left-4 block size-2.5 p-0 bg-green-500 border-background"
                      title="Custom color"
                    />
                  ))}

                {/* Display color list */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setActiveColorId(color.id)}
                  aria-label={`${color.name} (${color.hex})`}
                  title={`${color.name} (${color.hex})`}
                  className={`size-6 rounded-full ${
                    activeColorId === color.id
                      ? "ring-2 ring-primary"
                      : "hover:ring-2 hover:ring-accent"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          
          {/* Custom color */}
          <Label>Color name</Label>
          <Input
            id="custom-name"
            type="text"
            placeholder="Color name (e.g., Neon Pink)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />

          {/* Hex code */}
          <Label>Hex code</Label>
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

          <div className="flex items-center gap-2">
            {/* Add custom color button */}
            <Button
              variant="destructive"
              className="grow"
              onClick={addCustomColor}
            >
              Add Custom Color
            </Button>

            {/* display trash icon when custom color exists otherwise hide - delete color */}
            {hasCustomColors && (
              <Button
                type="button"
                variant={isDeleteCustomMode ? "destructive" : "outline"}
                onClick={toggleDeleteCustomMode}
                title={
                  isDeleteCustomMode
                    ? "Exit delete mode"
                    : "Delete custom colors"
                }
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorManagement;
