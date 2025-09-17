import React from "react";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const Resolution = ({
  baseGrid,
  onSelectBase,
  min,
  max,
  step,
  width,
  height,
  onWidth,
  onHeight,
  cols,
  rows,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Grid3X3 className="size-5 text-primary" />
        <CardTitle className="font-sans">Base Grid & Resolution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2">
          <Button
            variant={baseGrid === 16 ? "destructive" : "outline"}
            className="grow justify-center"
            onClick={() => onSelectBase(16)}
          >
            16 × 16 studs
          </Button>
          <Button
            variant={baseGrid === 32 ? "destructive" : "outline"}
            className="grow justify-center"
            onClick={() => onSelectBase(32)}
          >
            32 × 32 studs
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Label>Width</Label>
            <Badge variant="destructive">{width} studs</Badge>
          </div>
          <Slider
            min={min}
            max={max}
            step={step}
            value={[width]}
            onValueChange={([v]) => onWidth(v)}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Height</Label>
            <Badge variant="destructive">{height} studs</Badge>
          </div>
          <Slider
            min={min}
            max={max}
            step={step}
            value={[height]}
            onValueChange={([v]) => onHeight(v)}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>

        <Card className="text-sm py-3 bg-muted-foreground/5">
          <CardContent className="px-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground font-mono">
                Configuration:
              </Label>
              <Label className="font-semibold font-mono">
                {width} × {height}
              </Label>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground font-mono">
                Sections:
              </Label>
              <Label className="font-semibold font-mono">
                {cols} × {rows} ({baseGrid}×{baseGrid})
              </Label>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground font-mono">
                Grid layout:
              </Label>
              <Label className="font-semibold font-mono">
                {cols} × {rows}
              </Label>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default Resolution;
