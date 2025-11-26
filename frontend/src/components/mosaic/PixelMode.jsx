import React from "react";
import { Square, Circle, PictureInPicture } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PIXEL_MODES } from "@/constant/pixelConfig";

const PixelMode = ({ pixelMode, setPixelMode }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <PictureInPicture className="size-5 text-primary" />
        <CardTitle className="font-sans">Pixel Display Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={pixelMode === PIXEL_MODES.ROUND_TILE ? "destructive" : "outline"}
            onClick={() => setPixelMode(PIXEL_MODES.ROUND_TILE)}
          >
            <Circle className="size-5" />
            Round Tiles
          </Button>
          <Button
            type="button"
            variant={pixelMode === PIXEL_MODES.SQUARE_TILE ? "destructive" : "outline"}
            onClick={() => setPixelMode(PIXEL_MODES.SQUARE_TILE)}
          >
            <Square className="size-5" />
            Square Tiles
          </Button>
          <Button
            type="button"
            variant={pixelMode === PIXEL_MODES.SQUARE_PLATE ? "destructive" : "outline"}
            onClick={() => setPixelMode(PIXEL_MODES.SQUARE_PLATE)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Square Plates
          </Button>
          <Button
            type="button"
            variant={pixelMode === PIXEL_MODES.ROUND_PLATE ? "destructive" : "outline"}
            onClick={() => setPixelMode(PIXEL_MODES.ROUND_PLATE)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Round Plates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixelMode;
