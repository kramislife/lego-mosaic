export const drawSquarePlate = ({
  ctx,
  px,
  py,
  cellSize,
  hex,
  cx,
  cy,
  innerRadius,
  borderColor,
  borderWidth,
  hasOutline,
  outlineColor,
  outlineWidth,
  outlineOffset,
}) => {
  ctx.fillStyle = hex;
  ctx.fillRect(px, py, cellSize, cellSize);

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  if (hasOutline) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.strokeRect(
      px + outlineOffset,
      py + outlineOffset,
      cellSize - outlineWidth,
      cellSize - outlineWidth
    );
  }
};

export default drawSquarePlate;