export const drawSquareTile = ({
  ctx,
  px,
  py,
  cellSize,
  hex,
  hasOutline,
  outlineColor,
  outlineWidth,
  outlineOffset,
}) => {
  ctx.fillStyle = hex;
  ctx.fillRect(px, py, cellSize, cellSize);

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

export default drawSquareTile;