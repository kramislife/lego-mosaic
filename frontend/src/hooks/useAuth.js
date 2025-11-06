import { useState } from "react";
import { toast } from "sonner";
import { useLoginMutation, useRegisterMutation } from "@/redux/api/authApi";

// ==================== Login  ====================
export const useLogin = () => {
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [login, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = values;
    try {
      await login({ identifier, password }).unwrap();
      toast.success("Logged in successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return {
    values,
    isLoading,
    handleChange,
    handleSubmit,
  };
};

// ==================== Register  ====================
export const useRegister = () => {
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [focusedField, setFocusedField] = useState(null);

  const passwordValidations = {
    minLength: formData.password.length >= 6,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*_]/.test(formData.password),
  };

  const showPasswordRequirements =
    focusedField === "password" ||
    focusedField === "confirmPassword" ||
    formData.password.length > 0;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordFocus = (field) => () => {
    setFocusedField(field);
  };

  const handlePasswordBlur = () => {
    setFocusedField(null);
  };

  const handleAgreedChange = (checked) => {
    setAgreed(Boolean(checked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      fullName,
      username,
      contactNumber,
      email,
      password,
      confirmPassword,
    } = formData;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the terms to continue");
      return;
    }
    try {
      await registerUser({
        fullName,
        username,
        contactNumber,
        email,
        password,
      }).unwrap();
      toast.success("Registered successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  return {
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
  };
};
