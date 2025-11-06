export function isValidHex(hex) {
  return typeof hex === "string" && /^#([0-9A-Fa-f]{6})$/.test(hex);
}

export function validateColorName(name, existing = []) {
  const trimmed = (name || "").trim();
  if (!trimmed) return { ok: false, message: "Color name is required" };
  const exists = existing.some(
    (c) => (c?.name || "").toLowerCase() === trimmed.toLowerCase()
  );
  if (exists)
    return { ok: false, message: "A color with this name already exists" };
  return { ok: true };
}

export default { isValidHex, validateColorName };
