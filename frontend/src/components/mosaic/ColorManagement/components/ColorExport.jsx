import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const ColorExport = ({
  exportMode,
  setExportMode,
  selectedIds,
  toggleId,
  selectGroup,
  builtInColors,
  customColors,
  totalCount,
  builtInCount,
  customCount,
  onCancel,
  onConfirm,
}) => {
  const modeOptions = useMemo(
    () => [
      { key: "all", title: "Export All", visible: true },
      { key: "custom", title: "Custom Only", visible: customCount > 0 },
      { key: "pick", title: "Choose specific colors", visible: true },
    ],
    [customCount]
  );

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="font-sans mb-3">
          Choose Colors to Export
        </DialogTitle>
      </DialogHeader>
      <DialogDescription className="sr-only">
        Choose the colors you want to export from the list below.
      </DialogDescription>

      {/* Mode selector */}
      <div className="flex flex-col sm:flex-row gap-2">
        {modeOptions
          .filter((opt) => opt.visible)
          .map((opt) => (
            <Button
              key={opt.key}
              variant={exportMode === opt.key ? "destructive" : "outline"}
              onClick={() => setExportMode(opt.key)}
              className="flex-1 p-5 font-bold"
            >
              {opt.title}
            </Button>
          ))}
      </div>

      {/* Totals bar */}
      <div className="rounded-md border p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {exportMode !== "pick" ? (
              <>
                <Label>Total</Label>
                <Badge variant="outline" className="rounded-md py-1 text-sm">
                  {exportMode === "custom" ? customCount : totalCount} colors
                </Badge>
              </>
            ) : (
              <Badge variant="outline" className="rounded-md py-1 text-sm">
                {selectedIds.size}/{totalCount} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {exportMode !== "custom" && (
              <Badge variant="outline" className="rounded-md py-1 text-sm">
                <span className="inline-block size-2 rounded-full bg-secondary mb-0.5" />
                Built-in: {builtInCount}
              </Badge>
            )}
            {customCount > 0 && (
              <Badge variant="outline" className="rounded-md py-1 text-sm">
                <span className="inline-block size-2 rounded-full bg-primary mb-0.5" />
                Custom: {customCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Hand-pick panel */}
      {exportMode === "pick" && (
        <div className="space-y-5">
          {customCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="font-bold">
                  Custom Colors ({customCount})
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => selectGroup(customColors, true)}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => selectGroup(customColors, false)}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-h-70 overflow-y-auto pr-1">
                {customColors.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 cursor-pointer mt-2"
                  >
                    <Checkbox
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={() => toggleId(c.id)}
                    />
                    <span className="inline-flex items-center text-sm grow justify-between">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="inline-block size-4 rounded-full border"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </span>
                      <span className="text-muted-foreground">{c.hex}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <Label className="font-bold">
                Built-in Colors ({builtInCount})
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => selectGroup(builtInColors, true)}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => selectGroup(builtInColors, false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-h-70 overflow-y-auto pr-1">
              {builtInColors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 cursor-pointer mt-2"
                >
                  <Checkbox
                    checked={selectedIds.has(c.id)}
                    onCheckedChange={() => toggleId(c.id)}
                    aria-label={`Select ${c.name}`}
                  />
                  <span className="inline-flex items-center text-sm grow justify-between">
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="inline-block size-4 rounded-full border"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </span>
                    <span className="text-muted-foreground">{c.hex}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={
            exportMode === "pick"
              ? selectedIds.size === 0
              : exportMode === "custom"
              ? customCount === 0
              : totalCount === 0
          }
        >
          Export CSV (
          {exportMode === "pick"
            ? selectedIds.size
            : exportMode === "custom"
            ? customCount
            : totalCount}
          )
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ColorExport;
