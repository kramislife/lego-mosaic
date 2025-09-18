import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ErrorState = ({
  title = "Error Loading",
  message = "Please refresh the page or try again later",
  showCard = true,
}) => {
  const content = (
    <div className="text-center py-5">
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="size-8 text-destructive" />
        <div>
          <p className="font-sans font-medium text-destructive">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <CardTitle className="font-sans">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default ErrorState;
