import { EventType, HandlingEvent, SensorSample, Sensitivity, Thresholds, Vector3 } from '../types';

export const ZERO_VECTOR: Vector3 = { x: 0, y: 0, z: 0 };

export const SENSITIVITY_THRESHOLDS: Record<Sensitivity, Thresholds> = {
  gentle: { tiltAngle: 30, flipAngle: 125, impactG: 1.85, rotationRate: 2.5, shakeDelta: 0.48 },
  normal: { tiltAngle: 45, flipAngle: 140, impactG: 2.25, rotationRate: 3.4, shakeDelta: 0.68 },
  rugged: { tiltAngle: 60, flipAngle: 155, impactG: 2.8, rotationRate: 4.5, shakeDelta: 0.9 },
};

export const magnitude = (vector: Vector3) =>
  Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

export const lowPass = (previous: Vector3, next: Vector3, alpha = 0.16): Vector3 => ({
  x: previous.x + alpha * (next.x - previous.x),
  y: previous.y + alpha * (next.y - previous.y),
  z: previous.z + alpha * (next.z - previous.z),
});

export const angleBetween = (a: Vector3, b: Vector3) => {
  const denominator = magnitude(a) * magnitude(b);
  if (denominator < 0.001) return 0;
  const cosine = Math.max(-1, Math.min(1, (a.x * b.x + a.y * b.y + a.z * b.z) / denominator));
  return (Math.acos(cosine) * 180) / Math.PI;
};

export const makeSample = (
  accel: Vector3,
  gyro: Vector3,
  gravity: Vector3,
  baseline: Vector3,
  elapsedMs: number,
): SensorSample => ({
  elapsedMs,
  accel,
  gyro,
  accelerationG: magnitude(accel),
  rotationRate: magnitude(gyro),
  tiltAngle: angleBetween(gravity, baseline),
});

export const classifySample = (
  sample: SensorSample,
  thresholds: Thresholds,
): { type: EventType; severity: 'warning' | 'critical'; value: number } | null => {
  const impactDelta = Math.abs(sample.accelerationG - 1);
  if (sample.accelerationG >= thresholds.impactG) {
    return { type: 'impact', severity: 'critical', value: sample.accelerationG };
  }
  if (sample.tiltAngle >= thresholds.flipAngle) {
    return { type: 'flip', severity: 'critical', value: sample.tiltAngle };
  }
  if (impactDelta >= thresholds.shakeDelta && sample.rotationRate >= thresholds.rotationRate * 0.5) {
    return { type: 'shake', severity: 'warning', value: impactDelta };
  }
  if (sample.tiltAngle >= thresholds.tiltAngle) {
    return { type: 'tilt', severity: 'warning', value: sample.tiltAngle };
  }
  if (sample.rotationRate >= thresholds.rotationRate) {
    return { type: 'rotation', severity: 'warning', value: sample.rotationRate };
  }
  return null;
};

const EVENT_COPY: Record<EventType, { title: string; unit: string }> = {
  tilt: { title: 'เอียงเกินกำหนด', unit: '°' },
  flip: { title: 'พัสดุพลิกกลับด้าน', unit: '°' },
  impact: { title: 'ตรวจพบแรงกระแทก', unit: 'g' },
  shake: { title: 'ตรวจพบการเขย่า', unit: 'g' },
  rotation: { title: 'หมุนเร็วผิดปกติ', unit: ' rad/s' },
};

export const createHandlingEvent = (
  detected: NonNullable<ReturnType<typeof classifySample>>,
  timestamp: number,
  elapsedMs: number,
): HandlingEvent => {
  const copy = EVENT_COPY[detected.type];
  return {
    id: `${timestamp}-${detected.type}`,
    type: detected.type,
    severity: detected.severity,
    timestamp,
    elapsedMs,
    value: detected.value,
    title: copy.title,
    detail: `${detected.value.toFixed(1)}${copy.unit}`,
  };
};

export const eventCooldown = (type: EventType) => {
  if (type === 'impact' || type === 'shake') return 1200;
  if (type === 'rotation') return 1600;
  return 2600;
};
