export const drawRoundPlate = ({
  ctx,
  cx,
  cy,
  radius,
  innerRadius,
  hex,
  borderColor,
  borderWidth,
}) => {
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
};

export default drawRoundPlate;