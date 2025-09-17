import React from "react";
import { Square, Circle, PictureInPicture } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
            variant={pixelMode === "square" ? "destructive" : "outline"}
            active={pixelMode === "square"}
            onClick={() => setPixelMode("square")}
          >
            <Square className="size-5" />
            Squares
          </Button>
          <Button
            type="button"
            variant={pixelMode === "circle" ? "destructive" : "outline"}
            onClick={() => setPixelMode("circle")}
          >
            <Circle className="size-5" />
            Circles
          </Button>
          <Button
            type="button"
            variant={pixelMode === "square_plate" ? "destructive" : "outline"}
            onClick={() => setPixelMode("square_plate")}
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
            Concentric Squares
          </Button>
          <Button
            type="button"
            variant={pixelMode === "circle_plate" ? "destructive" : "outline"}
            onClick={() => setPixelMode("circle_plate")}
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
            Concentric Circles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixelMode;
