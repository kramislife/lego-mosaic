export function generateFilterFromAdjustments({
  hue = 0,
  saturation = 0,
  brightness = 0,
  contrast = 0,
}) {
  const filters = [];
  if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
  if (saturation !== 0) filters.push(`saturate(${1 + saturation / 100})`);
  if (brightness !== 0)
    filters.push(`brightness(${1 + (brightness / 100) * 0.7})`);
  if (contrast !== 0) filters.push(`contrast(${1 + (contrast / 100) * 0.7})`);
  return filters.length > 0 ? filters.join(" ") : "none";
}

export default generateFilterFromAdjustments;
