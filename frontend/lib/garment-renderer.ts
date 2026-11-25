import type { Product } from './products';
import {
  getTorsoGeometry,
  add,
  multiply,
  between,
  type BodyPoint,
  type Point,
} from './overlay-geometry';
type Triangle = [Point, Point, Point];

/** Draw a source texture triangle into a destination triangle using an affine map. */
function textureTriangle(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  source: Triangle,
  target: Triangle,
) {
  const [s0, s1, s2] = source;
  const [t0, t1, t2] = target;
  const denominator = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y);
  if (Math.abs(denominator) < 0.001) return;
  const a = ((t1.x - t0.x) * (s2.y - s0.y) - (t2.x - t0.x) * (s1.y - s0.y)) / denominator;
  const c = ((s1.x - s0.x) * (t2.x - t0.x) - (s2.x - s0.x) * (t1.x - t0.x)) / denominator;
  const b = ((t1.y - t0.y) * (s2.y - s0.y) - (t2.y - t0.y) * (s1.y - s0.y)) / denominator;
  const d = ((s1.x - s0.x) * (t2.y - t0.y) - (s2.x - s0.x) * (t1.y - t0.y)) / denominator;
  context.save();
  context.beginPath();
  context.moveTo(t0.x, t0.y);
  context.lineTo(t1.x, t1.y);
  context.lineTo(t2.x, t2.y);
  context.closePath();
  context.clip();
  context.transform(a, b, c, d, t0.x - a * s0.x - c * s0.y, t0.y - b * s0.x - d * s0.y);
  context.drawImage(image, 0, 0);
  context.restore();
}

function textureQuad(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  source: [Point, Point, Point, Point],
  target: [Point, Point, Point, Point],
) {
  textureTriangle(
    context,
    image,
    [source[0], source[1], source[2]],
    [target[0], target[1], target[2]],
  );
  textureTriangle(
    context,
    image,
    [source[0], source[2], source[3]],
    [target[0], target[2], target[3]],
  );
}

function segmentEdges(
  start: Point,
  end: Point,
  startWidth: number,
  endWidth: number,
): [Point, Point, Point, Point] {
  const dx = end.x - start.x,
    dy = end.y - start.y,
    length = Math.max(1, Math.hypot(dx, dy));
  const normal = { x: dy / length, y: -dx / length };
  return [
    add(start, multiply(normal, -startWidth / 2)),
    add(start, multiply(normal, startWidth / 2)),
    add(end, multiply(normal, endWidth / 2)),
    add(end, multiply(normal, -endWidth / 2)),
  ];
}

/** A small articulated texture mesh: torso, upper sleeves, lower sleeves, then hands. */
export function renderGarment(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sourceVideo: CanvasImageSource,
  landmarks: BodyPoint[],
  frame: { width: number; height: number },
  anchors: Product['overlay'],
  adjustment: { scale: number; offset: number },
) {
  const torso = getTorsoGeometry(landmarks, frame);
  if (!torso) return;
  const {
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
  } = torso;
  const shift = multiply(down, span * adjustment.offset);
  const adjust = (point: Point) =>
    add(
      add(
        centre,
        multiply({ x: point.x - centre.x, y: point.y - centre.y }, adjustment.scale),
      ),
      shift,
    );
  const width = image.naturalWidth,
    height = image.naturalHeight;
  const sourcePoint = (x: number, y: number) => ({ x: x * width, y: y * height });
  const torsoLeft = anchors.torsoLeft,
    torsoRight = anchors.torsoRight;

  // Sleeves move around their own shoulder/elbow/wrist joints instead of the torso.
  for (const shoulderIndex of [leftIndex, rightIndex]) {
    const isLeft = shoulderIndex === leftIndex;
    const elbowIndex = shoulderIndex + 2,
      wristIndex = shoulderIndex + 4;
    const shoulder = pixel(shoulderIndex);
    const elbow =
      (landmarks[elbowIndex]?.visibility ?? 0) > 0.4
        ? pixel(elbowIndex)
        : add(shoulder, multiply(down, span * 0.65));
    const wrist =
      (landmarks[wristIndex]?.visibility ?? 0) > 0.35
        ? pixel(wristIndex)
        : add(elbow, multiply(down, span * 0.65));
    const sleeveLength =
      anchors.sleeve === 'short' ? 0.45 : anchors.sleeve === 'three-quarter' ? 0.75 : 1;
    const sleeveBottom = anchors.sleeveBottom;
    const sourceX0 = isLeft ? 0 : torsoRight,
      sourceX1 = isLeft ? torsoLeft : 1;
    const upperEnd = sleeveLength < 0.5 ? between(shoulder, elbow, 0.63) : elbow;
    const root = add(shoulder, multiply(down, span * 0.04));
    const upperQuad = segmentEdges(
      adjust(root),
      adjust(upperEnd),
      span * 0.27 * adjustment.scale,
      span * 0.22 * adjustment.scale,
    );
    const sourceMid =
      anchors.sleeve === 'short' ? sleeveBottom : 0.12 + (sleeveBottom - 0.12) * 0.5;
    // Flip the left texture's transverse direction while preserving garment orientation.
    const srcUpper: [Point, Point, Point, Point] = [
      sourcePoint(sourceX0, 0.12),
      sourcePoint(sourceX1, 0.12),
      sourcePoint(sourceX1, sourceMid),
      sourcePoint(sourceX0, sourceMid),
    ];
    textureQuad(context, image, srcUpper, upperQuad);
    if (sleeveLength >= 0.5) {
      const end = between(elbow, wrist, sleeveLength === 1 ? 1 : 0.55);
      textureQuad(
        context,
        image,
        [
          sourcePoint(sourceX0, sourceMid),
          sourcePoint(sourceX1, sourceMid),
          sourcePoint(sourceX1, sleeveBottom),
          sourcePoint(sourceX0, sleeveBottom),
        ],
        segmentEdges(
          adjust(elbow),
          adjust(end),
          span * 0.22 * adjustment.scale,
          span * 0.17 * adjustment.scale,
        ),
      );
    }
  }

  // The collar begins at the neck base, not a torso-length-scaled distance above it.
  const topLeft = adjust(add(shoulderLeft, multiply(down, -span * 0.055)));
  const topRight = adjust(add(shoulderRight, multiply(down, -span * 0.055)));
  const hemLeft = adjust(add(hipCentre, multiply(horizontal, -span * 0.48)));
  const hemRight = adjust(add(hipCentre, multiply(horizontal, span * 0.48)));
  textureQuad(
    context,
    image,
    [
      sourcePoint(torsoLeft, 0),
      sourcePoint(torsoRight, 0),
      sourcePoint(torsoRight, 1),
      sourcePoint(torsoLeft, 1),
    ],
    [topLeft, topRight, hemRight, hemLeft],
  );

  // Preserve the real face and hands when they cross the garment.
  if ((landmarks[7]?.visibility ?? 0) > 0.4 && (landmarks[8]?.visibility ?? 0) > 0.4) {
    const earLeft = pixel(7),
      earRight = pixel(8),
      faceCentre = between(earLeft, earRight, 0.5);
    const faceWidth = Math.hypot(earLeft.x - earRight.x, earLeft.y - earRight.y);
    context.save();
    context.beginPath();
    context.ellipse(
      faceCentre.x,
      faceCentre.y - faceWidth * 0.13,
      faceWidth * 0.64,
      faceWidth * 0.82,
      Math.atan2(horizontal.y, horizontal.x),
      0,
      Math.PI * 2,
    );
    context.clip();
    context.drawImage(sourceVideo, 0, 0, frame.width, frame.height);
    context.restore();
  }
  for (const [wristIndex, fingerIndex] of [
    [15, 19],
    [16, 20],
  ]) {
    if (
      (landmarks[wristIndex]?.visibility ?? 0) < 0.55 ||
      (landmarks[fingerIndex]?.visibility ?? 0) < 0.55
    )
      continue;
    const wrist = pixel(wristIndex),
      finger = pixel(fingerIndex),
      hand = between(wrist, finger, 0.65);
    const length = Math.max(
      span * 0.06,
      Math.hypot(wrist.x - finger.x, wrist.y - finger.y),
    );
    context.save();
    context.beginPath();
    context.ellipse(
      hand.x,
      hand.y,
      length * 0.65,
      length * 0.9,
      Math.atan2(finger.y - wrist.y, finger.x - wrist.x) - Math.PI / 2,
      0,
      Math.PI * 2,
    );
    context.clip();
    context.drawImage(sourceVideo, 0, 0, frame.width, frame.height);
    context.restore();
  }
}
