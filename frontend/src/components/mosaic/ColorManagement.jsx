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

const ColorManagement = ({
  tool,
  setTool,
  colors,
  activeColorId,
  setActiveColorId,
  customName,
  setCustomName,
  customHex,
  setCustomHex,
}) => {
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
            {colors.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setActiveColorId(c.id)}
                aria-label={`${c.name} (${c.hex})`}
                title={`${c.name} (${c.hex})`}
                className={`size-6 rounded-full p-0 ${
                  activeColorId === c.id
                    ? "ring-2 ring-primary"
                    : "hover:ring-1 hover:ring-muted-foreground/30"
                }`}
                style={{ backgroundColor: c.hex }}
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
              <div
                className="h-10 w-14 rounded-md border"
                style={{ backgroundColor: customHex }}
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
