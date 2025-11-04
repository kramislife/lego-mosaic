import React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks/useAuth";

const Register = () => {
  const {
    formData,
    agreed,
    isLoading,
    passwordValidations,
    showPasswordRequirements,
    handleChange,
    handlePasswordFocus,
    handlePasswordBlur,
    handleAgreedChange,
    handleSubmit,
  } = useRegister();

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="font-bold">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Username</Label>
          <Input
            id="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Contact Number</Label>
          <Input
            id="contactNumber"
            placeholder="+1 (555) 000-0000"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-bold">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          onFocus={handlePasswordFocus("password")}
          onBlur={handlePasswordBlur}
          required
        />
        {showPasswordRequirements && (
          <div className="mt-2 p-3 bg-muted/70 rounded-md space-y-2">
            <p className="text-sm font-medium text-foreground">
              Password Requirements:
            </p>
            <div className="space-y-1">
              {Object.entries({
                minLength: "At least 6 characters",
                hasUppercase: "One uppercase letter (A-Z)",
                hasLowercase: "One lowercase letter (a-z)",
                hasNumber: "One number (0-9)",
                hasSpecialChar: "One special character (!@#$%^&*_)",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {passwordValidations[key] ? (
                    <Check className="h-4 w-4 text-chart-4" />
                  ) : (
                    <X className="h-4 w-4 text-primary" />
                  )}
                  <span
                    className={
                      passwordValidations[key]
                        ? "text-chart-4"
                        : "text-primary dark:text-accent"
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="font-bold">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onFocus={handlePasswordFocus("confirmPassword")}
          onBlur={handlePasswordBlur}
          required
        />
      </div>
      <div className="flex items-start gap-2 text-sm mt-5">
        <Checkbox
          checked={agreed}
          onCheckedChange={handleAgreedChange}
          aria-label="Agree to terms"
        />
        <span>
          I agree to the{" "}
          <a className="underline text-primary" href="#">
            Terms of Use
          </a>{" "}
          and{" "}
          <a className="underline text-primary" href="#">
            Privacy Policy
          </a>
        </span>
      </div>
      <Button
        type="submit"
        variant="destructive"
        className="w-full"
        disabled={!agreed || isLoading}
      >
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
};

export default Register;
