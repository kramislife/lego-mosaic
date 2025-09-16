import React from "react";
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">Hello World</h1>
      <h1 className="text-3xl font-bold font-sans">Hello World</h1>
      <h1 className="text-3xl font-bold font-serif">Hello World</h1>
      <h1 className="text-3xl font-bold font-mono">Hello World</h1>
      <Button variant="destructive">Click me</Button>
    </div>
  );
};

export default App;
