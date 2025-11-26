import React from "react";
import Header from "@/components/layout/header/Header";
import Mosaic from "@/pages/Mosaic";
import { Toaster } from "@/components/ui/sonner";
import { ExpandProvider } from "@/contexts/ExpandContext";

const App = () => {
  return (
    <ExpandProvider>
      <Header />
      <Mosaic />
      <Toaster />
    </ExpandProvider>
  );
};

export default App;
