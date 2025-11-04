import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";

const Auth = () => {
  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          Welcome to LEGO Mosaic Studio
        </DialogTitle>
      </DialogHeader>
      <DialogDescription className="sr-only">
        Please select an option to continue
      </DialogDescription>
      <div className="space-y-5">
        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-5">
            <Login />
          </TabsContent>

          <TabsContent value="register" className="mt-5">
            <Register />
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  );
};

export default Auth;
