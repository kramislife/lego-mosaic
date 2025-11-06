import React from "react";
import { Lightbulb, Zap } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GUIDE_STEPS, PRO_FEATURES, PRO_TIPS } from "@/constant/guideConfig";

const Guide = () => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-xl font-sans pb-5">
          LEGO Mosaic Guide
        </DialogTitle>
      </DialogHeader>
      <DialogDescription className="sr-only">
        This is a guide for the LEGO Mosaic Studio.
      </DialogDescription>

      {/* Welcome Section */}
      <Card className="mb-5 bg-primary/10 border-primary/20">
        <CardContent className="p-5 text-center">
          <div className="size-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <Zap className="size-6 text-white" />
          </div>
          <h2 className="text-xl font-bold font-sans pb-2">
            Welcome to LEGO Mosaic Studio!
          </h2>
          <p className="text-muted-foreground">
            Transform your photos into amazing LEGO mosaics with just a few
            clicks.
          </p>
        </CardContent>
      </Card>

      {/* Main Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {GUIDE_STEPS.map(({ id, icon: Icon, title, desc, tip }) => {
          return (
            <Card key={id}>
              <CardContent className="text-center">
                <div className="size-12 bg-destructive/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Icon className="size-6 text-destructive" />
                </div>
                <Label className="font-sans text-lg block">{title}</Label>
                <p className="text-muted-foreground text-sm mt-2 mb-3">
                  {desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pro Features */}
      <Card className="mb-5">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="size-5 text-destructive" />
            <Label className="text-xl font-sans font-bold">Features</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {PRO_FEATURES.map(
              ({ icon: Icon, title, desc, colorClass }, idx) => (
                <div key={idx} className="text-center p-4">
                  <div
                    className={`size-12 ${colorClass} rounded-xl mx-auto mb-3 flex items-center justify-center`}
                  >
                    <Icon className="size-6 text-background dark:text-foreground" />
                  </div>
                  <h4 className="font-sans text-lg mb-1">{title}</h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-accent/10 border-accent/20">
        <CardContent>
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="size-5 text-accent" />
            <h3 className="text-xl font-sans font-bold">
              Pro Tips for Best Results
            </h3>
          </div>

          <div className="space-y-5">
            {PRO_TIPS.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 ml-7">
                <div className="size-2 rounded-full bg-foreground mt-1"></div>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
