export const drawRoundTile = ({ ctx, cx, cy, radius, hex }) => {
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
};

export default drawRoundTile;