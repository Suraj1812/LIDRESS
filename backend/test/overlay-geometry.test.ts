import { describe, expect, it } from 'vitest';
import {
  getTorsoGeometry,
  smoothLandmarks,
  type BodyPoint,
} from '../../frontend/lib/overlay-geometry';
const frame = { width: 1280, height: 720 };
function pose(): BodyPoint[] {
  const points = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 }));
  points[11] = { x: 0.35, y: 0.3, visibility: 0.99 };
  points[12] = { x: 0.65, y: 0.3, visibility: 0.99 };
  points[23] = { x: 0.4, y: 0.9, visibility: 0.9 };
  points[24] = { x: 0.6, y: 0.9, visibility: 0.9 };
  return points;
}
describe('articulated body geometry', () => {
  it('anchors clothing at the shoulder line', () => {
    const torso = getTorsoGeometry(pose(), frame)!;
    expect(torso.centre.x).toBeCloseTo(640);
    expect(torso.centre.y).toBeCloseTo(216);
  });
  it('hides clothing when a shoulder is unreliable', () => {
    const points = pose();
    points[11].visibility = 0.1;
    expect(getTorsoGeometry(points, frame)).toBeNull();
  });
  it('estimates a bounded torso when the hips are outside laptop framing', () => {
    const points = pose();
    points[23].visibility = 0;
    points[24].visibility = 0;
    const torso = getTorsoGeometry(points, frame)!;
    expect(torso.hipCentre.y).toBeGreaterThan(torso.centre.y);
    expect(
      Math.hypot(torso.hipCentre.x - torso.centre.x, torso.hipCentre.y - torso.centre.y),
    ).toBeCloseTo(torso.span * 1.35);
  });
  it('preserves screen-side geometry when anatomical landmark order changes', () => {
    const first = pose(),
      second = pose();
    [second[11], second[12]] = [second[12], second[11]];
    expect(getTorsoGeometry(first, frame)!.shoulderLeft).toEqual(
      getTorsoGeometry(second, frame)!.shoulderLeft,
    );
  });
  it('smooths movement but keeps current tracking confidence', () => {
    const previous = pose(),
      next = pose();
    next[11] = { x: 0.55, y: 0.5, visibility: 0.2 };
    const smoothed = smoothLandmarks(previous, next);
    expect(smoothed[11].x).toBeCloseTo(0.45);
    expect(smoothed[11].visibility).toBe(0.2);
  });
});
