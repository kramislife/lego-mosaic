import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const LoadingState = ({
  title = "Loading...",
  message = "Please wait while we load the data",
  icon: Icon,
  showCard = true,
}) => {
  const content = (
    <div className="text-center py-5">
      <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto"></div>
      <p className="font-sans font-medium text-sm text-muted-foreground mt-5">
        {message}
      </p>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-5 text-primary" />}
          <CardTitle className="font-sans">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default LoadingState;
