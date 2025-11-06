export function clampToAllowed(value, allowedSizes) {
  if (!Array.isArray(allowedSizes) || allowedSizes.length === 0) return value;
  let nearest = allowedSizes[0];
  let minDiff = Math.abs(value - nearest);
  for (const size of allowedSizes) {
    const diff = Math.abs(value - size);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = size;
    }
  }
  return nearest;
}

export default clampToAllowed;
