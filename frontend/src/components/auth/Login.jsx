import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";

const Login = () => {
  const { values, isLoading, handleChange, handleSubmit } = useLogin();

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label className="font-bold">Email or Username</Label>
        <Input
          placeholder="Enter your email or username"
          id="identifier"
          value={values.identifier}
          onChange={handleChange}
          autoComplete="username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="font-bold">Password</Label>
        <Input
          type="password"
          placeholder="Enter your password"
          id="password"
          value={values.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span />
        <Button
          variant="link"
          className="text-muted-foreground hover:text-primary p-0 hover:no-underline"
        >
          Forgot Password?
        </Button>
      </div>
      <Button
        type="submit"
        variant="destructive"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
};

export default Login;
