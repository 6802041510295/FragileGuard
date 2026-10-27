export type Vector3 = { x: number; y: number; z: number };

export type EventType = 'tilt' | 'flip' | 'impact' | 'shake' | 'rotation';
export type Severity = 'warning' | 'critical';
export type Sensitivity = 'gentle' | 'normal' | 'rugged';

export type SensorSample = {
  elapsedMs: number;
  accel: Vector3;
  gyro: Vector3;
  accelerationG: number;
  rotationRate: number;
  tiltAngle: number;
};

export type HandlingEvent = {
  id: string;
  type: EventType;
  severity: Severity;
  timestamp: number;
  elapsedMs: number;
  value: number;
  title: string;
  detail: string;
};

export type MonitoringSession = {
  id: string;
  startedAt: number;
  endedAt: number;
  status: 'safe' | 'warning' | 'critical';
  sensitivity: Sensitivity;
  events: HandlingEvent[];
  samples: SensorSample[];
  maxTilt: number;
  maxImpact: number;
  maxRotation: number;
};

export type Thresholds = {
  tiltAngle: number;
  flipAngle: number;
  impactG: number;
  rotationRate: number;
  shakeDelta: number;
};

export type SensorAvailability = {
  accelerometer: boolean | null;
  gyroscope: boolean | null;
};
