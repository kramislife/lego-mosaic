import React from "react";
import Header from "@/components/layout/header/Header";
import Mosaic from "@/pages/Mosaic";
import { Toaster } from "@/components/ui/sonner";

const App = () => {
  return (
    <div>
      <Header />
      <Mosaic />
      <Toaster />
    </div>
  );
};

export default App;
