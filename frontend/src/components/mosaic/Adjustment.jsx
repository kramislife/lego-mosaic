import React from "react";
import { Settings2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const Adjustment = ({
  hue,
  setHue,
  saturation,
  setSaturation,
  brightness,
  setBrightness,
  contrast,
  setContrast,
}) => {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-primary" />
          <CardTitle className="font-sans">Adjustments</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-label="Reset adjustments to default"
          title="Reset all adjustment sliders (hue, saturation, brightness, contrast)"
          onClick={() => {
            setHue(0);
            setSaturation(0);
            setBrightness(0);
            setContrast(0);
          }}
        >
          <RotateCcw className="size-4" />
          Reset Filters
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Hue</Label>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{hue}°</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHue(0)}
                aria-label="Reset Hue"
                title="Reset Hue"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[hue]}
            onValueChange={([v]) => setHue(v)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Saturation</Label>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{saturation}%</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSaturation(0)}
                aria-label="Reset Saturation"
                title="Reset Saturation"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
          <Slider
            min={-100}
            max={100}
            step={1}
            value={[saturation]}
            onValueChange={([v]) => setSaturation(v)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Brightness</Label>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{brightness}%</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setBrightness(0)}
                aria-label="Reset Brightness"
                title="Reset Brightness"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
          <Slider
            min={-100}
            max={100}
            step={1}
            value={[brightness]}
            onValueChange={([v]) => setBrightness(v)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Contrast</Label>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{contrast}%</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setContrast(0)}
                aria-label="Reset Contrast"
                title="Reset Contrast"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
          <Slider
            min={-100}
            max={100}
            step={1}
            value={[contrast]}
            onValueChange={([v]) => setContrast(v)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Adjustment;
