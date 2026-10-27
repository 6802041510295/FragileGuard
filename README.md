# FragileGuard

FragileGuard is an Android app that monitors package tilt, flipping, shaking, rotation, and impact using the phone's accelerometer and gyroscope.

## Features

- Reads accelerometer and gyroscope data every 50 ms
- Calibrates a starting orientation for the package
- Provides three sensitivity profiles: Fragile, Standard, and Rugged
- Detects tilt, flip, impact, shake, and rapid rotation events
- Uses haptic alerts and records the time and measured value of each event
- Displays a real-time motion chart
- Summarizes peak values for each monitoring session
- Stores journey history locally with AsyncStorage
- Replays recorded journey motion

## Get started

Install Node.js and Expo Go on an Android phone.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go and test on a physical phone. Most emulators do not provide real gyroscope data.

## Build an APK

Sign in to Expo once:

```bash
npx eas-cli@latest login
```

Then run:

```bash
npm run build:apk
```

The `apk` profile in `eas.json` sets `android.buildType` to `apk`. When EAS Build finishes, it provides a download link for an Android installation package.

## Build an AAB for Google Play

```bash
npm run build:aab
```

## Quality checks

```bash
npm run lint
npm run typecheck
npx expo-doctor
```

## Detection approach

- Tilt is calculated from the angle between the low-pass-filtered gravity vector and the calibrated baseline.
- Impact is detected from the total acceleration vector magnitude in g.
- Rotation is detected from three-axis angular velocity in rad/s.
- Each event type has an independent cooldown to reduce duplicate alerts.

The thresholds are practical estimates for a mini project. Calibrate them with the target phone and package before any field use.

## Key files

- `src/context/MonitoringContext.tsx` manages sensors, sessions, and local storage.
- `src/utils/motion.ts` contains motion calculations and event classification.
- `src/app/(tabs)/index.tsx` is the real-time monitoring screen.
- `src/app/(tabs)/history.tsx` displays saved journeys.
- `src/app/session/[id].tsx` displays summaries and replay.
- `app.json` contains the Android app and splash screen configuration.
- `eas.json` contains the APK and AAB build profiles.
