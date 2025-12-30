import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/components/ui/lib/utils"

function Progress({
  className,
  value,
  indeterminate = false,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full flex-1 transition-all",
          indeterminate && "w-1/3 animate-indeterminate-progress"
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
}

function GlobalProgress({ isProcessing }) {
  if (!isProcessing) return null;

  return (
    <div className="sticky top-[81px] z-40 w-full">
      <Progress indeterminate className="h-2 rounded-none" />
    </div>
  );
}

export { Progress, GlobalProgress }
