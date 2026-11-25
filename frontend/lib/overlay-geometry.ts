export interface BodyPoint {
  x: number;
  y: number;
  visibility?: number;
}
export interface Point {
  x: number;
  y: number;
}
export const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
export const multiply = (point: Point, factor: number): Point => ({
  x: point.x * factor,
  y: point.y * factor,
});
export const between = (a: Point, b: Point, amount: number): Point =>
  add(multiply(a, 1 - amount), multiply(b, amount));

/** Reliable shoulder geometry, with a bounded torso estimate for laptop framing. */
export function getTorsoGeometry(
  landmarks: BodyPoint[],
  frame: { width: number; height: number },
) {
  if (
    [11, 12].some(
      (index) => !landmarks[index] || (landmarks[index].visibility ?? 0) < 0.55,
    )
  )
    return null;
  const pixel = (index: number): Point => ({
    x: landmarks[index].x * frame.width,
    y: landmarks[index].y * frame.height,
  });
  const leftIndex = landmarks[11].x < landmarks[12].x ? 11 : 12;
  const rightIndex = leftIndex === 11 ? 12 : 11;
  const shoulderLeft = pixel(leftIndex),
    shoulderRight = pixel(rightIndex);
  const dx = shoulderRight.x - shoulderLeft.x,
    dy = shoulderRight.y - shoulderLeft.y;
  const span = Math.hypot(dx, dy);
  if (span < frame.width * 0.08) return null;
  const horizontal = { x: dx / span, y: dy / span },
    down = { x: -dy / span, y: dx / span };
  const centre = between(shoulderLeft, shoulderRight, 0.5);
  const hipsReliable = [23, 24].every(
    (index) => (landmarks[index]?.visibility ?? 0) > 0.5 && landmarks[index].y < 1.05,
  );
  const estimatedHip = add(centre, multiply(down, span * 1.35));
  let hipCentre = hipsReliable ? between(pixel(23), pixel(24), 0.5) : estimatedHip;
  const torsoLength = Math.hypot(hipCentre.x - centre.x, hipCentre.y - centre.y);
  if (torsoLength < span * 0.85 || torsoLength > span * 1.9 || hipCentre.y < centre.y)
    hipCentre = estimatedHip;
  return {
    pixel,
    leftIndex,
    rightIndex,
    shoulderLeft,
    shoulderRight,
    span,
    horizontal,
    down,
    centre,
    hipCentre,
  };
}

/** Smooth positions while keeping current-frame confidence for immediate tracking loss. */
export function smoothLandmarks(
  previous: BodyPoint[] | null,
  next: BodyPoint[],
): BodyPoint[] {
  return next.map((point, index) => ({
    x: previous ? previous[index].x * 0.5 + point.x * 0.5 : point.x,
    y: previous ? previous[index].y * 0.5 + point.y * 0.5 : point.y,
    visibility: point.visibility,
  }));
}
