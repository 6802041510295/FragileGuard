import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import {
  HandlingEvent,
  MonitoringSession,
  SensorAvailability,
  SensorSample,
  Sensitivity,
  Vector3,
} from '../types';
import {
  classifySample,
  createHandlingEvent,
  eventCooldown,
  lowPass,
  makeSample,
  magnitude,
  SENSITIVITY_THRESHOLDS,
  ZERO_VECTOR,
} from '../utils/motion';

const STORAGE_KEY = '@fragileguard/sessions-v1';
const SENSOR_INTERVAL_MS = 50;
const MAX_STORED_SESSIONS = 20;
const MAX_SESSION_SAMPLES = 900;

type MonitoringContextValue = {
  availability: SensorAvailability;
  isMonitoring: boolean;
  isLoading: boolean;
  startedAt: number | null;
  elapsedMs: number;
  liveSample: SensorSample;
  recentSamples: SensorSample[];
  currentEvents: HandlingEvent[];
  sessions: MonitoringSession[];
  sensitivity: Sensitivity;
  startMonitoring: () => Promise<boolean>;
  stopMonitoring: () => Promise<MonitoringSession | null>;
  calibrate: () => void;
  setSensitivity: (value: Sensitivity) => void;
  clearHistory: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSession: (id: string) => MonitoringSession | undefined;
};

const EMPTY_SAMPLE: SensorSample = {
  elapsedMs: 0,
  accel: ZERO_VECTOR,
  gyro: ZERO_VECTOR,
  accelerationG: 0,
  rotationRate: 0,
  tiltAngle: 0,
};

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

export function MonitoringProvider({ children }: PropsWithChildren) {
  const [availability, setAvailability] = useState<SensorAvailability>({ accelerometer: null, gyroscope: null });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [liveSample, setLiveSample] = useState<SensorSample>(EMPTY_SAMPLE);
  const [recentSamples, setRecentSamples] = useState<SensorSample[]>([]);
  const [currentEvents, setCurrentEvents] = useState<HandlingEvent[]>([]);
  const [sessions, setSessions] = useState<MonitoringSession[]>([]);
  const [sensitivity, setSensitivityState] = useState<Sensitivity>('normal');

  const accelRef = useRef<Vector3>(ZERO_VECTOR);
  const gyroRef = useRef<Vector3>(ZERO_VECTOR);
  const gravityRef = useRef<Vector3>({ x: 0, y: 0, z: 1 });
  const baselineRef = useRef<Vector3>({ x: 0, y: 0, z: 1 });
  const monitoringRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const sensitivityRef = useRef<Sensitivity>('normal');
  const samplesRef = useRef<SensorSample[]>([]);
  const eventsRef = useRef<HandlingEvent[]>([]);
  const lastEventAtRef = useRef<Partial<Record<HandlingEvent['type'], number>>>({});
  const renderCounterRef = useRef(0);
  const maxTiltRef = useRef(0);
  const maxImpactRef = useRef(0);
  const maxRotationRef = useRef(0);

  const persistSessions = useCallback(async (next: MonitoringSession[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_STORED_SESSIONS)));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setSessions(JSON.parse(value) as MonitoringSession[]);
      })
      .catch(() => setSessions([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;
    let accelerometerSubscription: ReturnType<typeof Accelerometer.addListener> | undefined;
    let gyroscopeSubscription: ReturnType<typeof Gyroscope.addListener> | undefined;

    const subscribe = async () => {
      if (Platform.OS === 'web') {
        setAvailability({ accelerometer: false, gyroscope: false });
        return;
      }
      const [accelerometerAvailable, gyroscopeAvailable] = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
      ]);
      if (!mounted) return;
      setAvailability({ accelerometer: accelerometerAvailable, gyroscope: gyroscopeAvailable });
      Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
      Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

      if (gyroscopeAvailable) {
        gyroscopeSubscription = Gyroscope.addListener((value) => {
          gyroRef.current = { x: value.x, y: value.y, z: value.z };
        });
      }

      if (accelerometerAvailable) {
        accelerometerSubscription = Accelerometer.addListener((value) => {
          const now = Date.now();
          const accel = { x: value.x, y: value.y, z: value.z };
          accelRef.current = accel;
          gravityRef.current = lowPass(gravityRef.current, accel);
          const elapsed = startedAtRef.current ? now - startedAtRef.current : 0;
          const sample = makeSample(accel, gyroRef.current, gravityRef.current, baselineRef.current, elapsed);
          setLiveSample(sample);

          if (!monitoringRef.current) return;
          renderCounterRef.current += 1;
          maxTiltRef.current = Math.max(maxTiltRef.current, sample.tiltAngle);
          maxImpactRef.current = Math.max(maxImpactRef.current, sample.accelerationG);
          maxRotationRef.current = Math.max(maxRotationRef.current, sample.rotationRate);
          if (renderCounterRef.current % 4 === 0) {
            setRecentSamples((previous) => [...previous.slice(-29), sample]);
          }
          if (renderCounterRef.current % 20 === 0 && samplesRef.current.length < MAX_SESSION_SAMPLES) {
            samplesRef.current.push(sample);
          }

          const detected = classifySample(sample, SENSITIVITY_THRESHOLDS[sensitivityRef.current]);
          if (!detected) return;
          const lastTimestamp = lastEventAtRef.current[detected.type] ?? 0;
          if (now - lastTimestamp < eventCooldown(detected.type)) return;
          lastEventAtRef.current[detected.type] = now;
          const event = createHandlingEvent(detected, now, elapsed);
          eventsRef.current = [event, ...eventsRef.current];
          setCurrentEvents(eventsRef.current);
          void Haptics.notificationAsync(
            event.severity === 'critical'
              ? Haptics.NotificationFeedbackType.Error
              : Haptics.NotificationFeedbackType.Warning,
          ).catch(() => undefined);
        });
      }
    };

    void subscribe();
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' && monitoringRef.current) {
        setElapsedMs(startedAtRef.current ? Date.now() - startedAtRef.current : 0);
      }
    });

    return () => {
      mounted = false;
      accelerometerSubscription?.remove();
      gyroscopeSubscription?.remove();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isMonitoring || !startedAt) return;
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 500);
    return () => clearInterval(timer);
  }, [isMonitoring, startedAt]);

  const startMonitoring = useCallback(async () => {
    if (!availability.accelerometer || !availability.gyroscope) return false;
    const now = Date.now();
    baselineRef.current = magnitude(gravityRef.current) > 0.2 ? { ...gravityRef.current } : { ...accelRef.current };
    startedAtRef.current = now;
    monitoringRef.current = true;
    samplesRef.current = [];
    eventsRef.current = [];
    lastEventAtRef.current = {};
    renderCounterRef.current = 0;
    maxTiltRef.current = 0;
    maxImpactRef.current = 0;
    maxRotationRef.current = 0;
    setStartedAt(now);
    setElapsedMs(0);
    setRecentSamples([]);
    setCurrentEvents([]);
    setIsMonitoring(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    return true;
  }, [availability]);

  const stopMonitoring = useCallback(async () => {
    if (!monitoringRef.current || !startedAtRef.current) return null;
    const endedAt = Date.now();
    monitoringRef.current = false;
    const capturedSamples = [...samplesRef.current];
    const capturedEvents = [...eventsRef.current];
    const hasCritical = capturedEvents.some((event) => event.severity === 'critical');
    const session: MonitoringSession = {
      id: `${startedAtRef.current}`,
      startedAt: startedAtRef.current,
      endedAt,
      status: hasCritical ? 'critical' : capturedEvents.length ? 'warning' : 'safe',
      sensitivity: sensitivityRef.current,
      events: capturedEvents,
      samples: capturedSamples,
      maxTilt: maxTiltRef.current,
      maxImpact: maxImpactRef.current,
      maxRotation: maxRotationRef.current,
    };
    const nextSessions = [session, ...sessions].slice(0, MAX_STORED_SESSIONS);
    setSessions(nextSessions);
    setIsMonitoring(false);
    setElapsedMs(endedAt - startedAtRef.current);
    setStartedAt(null);
    startedAtRef.current = null;
    await persistSessions(nextSessions);
    await Haptics.notificationAsync(
      session.status === 'critical'
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    return session;
  }, [persistSessions, sessions]);

  const calibrate = useCallback(() => {
    baselineRef.current = magnitude(gravityRef.current) > 0.2 ? { ...gravityRef.current } : { ...accelRef.current };
    void Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const setSensitivity = useCallback((value: Sensitivity) => {
    sensitivityRef.current = value;
    setSensitivityState(value);
  }, []);

  const clearHistory = useCallback(async () => {
    setSessions([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    setSessions((previous) => {
      const next = previous.filter((session) => session.id !== id);
      void persistSessions(next);
      return next;
    });
  }, [persistSessions]);

  const getSession = useCallback((id: string) => sessions.find((session) => session.id === id), [sessions]);

  const value = useMemo<MonitoringContextValue>(() => ({
    availability,
    isMonitoring,
    isLoading,
    startedAt,
    elapsedMs,
    liveSample,
    recentSamples,
    currentEvents,
    sessions,
    sensitivity,
    startMonitoring,
    stopMonitoring,
    calibrate,
    setSensitivity,
    clearHistory,
    deleteSession,
    getSession,
  }), [
    availability,
    isMonitoring,
    isLoading,
    startedAt,
    elapsedMs,
    liveSample,
    recentSamples,
    currentEvents,
    sessions,
    sensitivity,
    startMonitoring,
    stopMonitoring,
    calibrate,
    setSensitivity,
    clearHistory,
    deleteSession,
    getSession,
  ]);

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (!context) throw new Error('useMonitoring must be used within MonitoringProvider');
  return context;
}
