export function isValidImageType(type) {
  return (
    typeof type === "string" &&
    type.startsWith("image/") &&
    ["image/jpeg", "image/jpg", "image/png"].includes(type)
  );
}

export function validateImageFile(file) {
  if (!file) return { ok: false, message: "No file selected" };
  if (!isValidImageType(file.type))
    return {
      ok: false,
      message: "Please select a valid image file (JPG, JPEG, PNG)",
    };
  return { ok: true };
}

export default { isValidImageType, validateImageFile };
