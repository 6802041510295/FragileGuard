# FragileGuard

FragileGuard คือแอป Android สำหรับตรวจสอบการเอียง การพลิก การเขย่า การหมุน และแรงกระแทกของพัสดุ โดยอ่านค่าจริงจาก Accelerometer และ Gyroscope ในโทรศัพท์

## ฟีเจอร์

- อ่านค่า Accelerometer และ Gyroscope ทุก 50 ms
- ตั้งแนวเริ่มต้นของพัสดุ (calibration)
- ความไว 3 ระดับ: บอบบาง, ทั่วไป, ทนทาน
- ตรวจจับ Tilt, Flip, Impact, Shake และ Rotation
- แจ้งเตือนด้วยแรงสั่น พร้อมบันทึกเวลาและค่าที่ตรวจพบ
- กราฟการเคลื่อนไหวแบบเรียลไทม์
- สรุปค่าสูงสุดของแต่ละ session
- เก็บประวัติในเครื่องด้วย AsyncStorage
- Replay ข้อมูลการเดินทางย้อนหลัง

## เริ่มใช้งาน

ต้องติดตั้ง Node.js และแอป Expo Go บนโทรศัพท์ Android

```bash
npm install
npx expo start
```

สแกน QR code ด้วย Expo Go แล้วทดสอบบนโทรศัพท์จริง เนื่องจาก emulator ส่วนใหญ่ไม่มีข้อมูล Gyroscope จริง

## สร้างไฟล์ APK

ล็อกอิน Expo หนึ่งครั้ง:

```bash
npx eas-cli@latest login
```

จากนั้นสั่ง:

```bash
npm run build:apk
```

โปรไฟล์ `apk` ใน `eas.json` ตั้งค่า `android.buildType` เป็น `apk` แล้ว เมื่อ EAS Build เสร็จจะมีลิงก์ดาวน์โหลดไฟล์สำหรับติดตั้งบน Android โดยตรง

## สร้างไฟล์ AAB สำหรับ Google Play

```bash
npm run build:aab
```

## ตรวจคุณภาพโค้ด

```bash
npm run lint
npm run typecheck
npx expo-doctor
```

## หลักการตรวจจับ

- มุมเอียงคำนวณจากมุมระหว่างเวกเตอร์แรงโน้มถ่วงที่กรองด้วย low-pass filter กับแนวฐานตอนเริ่ม session
- แรงกระแทกดูจากขนาดเวกเตอร์ความเร่งรวมในหน่วย g
- การหมุนดูจากขนาดเวกเตอร์ความเร็วเชิงมุมในหน่วย rad/s
- ทุกประเภทมี cooldown แยกกันเพื่อลดเหตุการณ์ซ้ำติดกัน

เกณฑ์เป็นค่าประมาณสำหรับมินิโปรเจกต์ ควรทดลองกับโทรศัพท์และลักษณะพัสดุจริงก่อนนำไปใช้งานภาคสนาม

## โครงสร้างสำคัญ

- `src/context/MonitoringContext.tsx` จัดการเซนเซอร์ session และการบันทึกข้อมูล
- `src/utils/motion.ts` อัลกอริทึมคำนวณและจำแนกเหตุการณ์
- `src/app/(tabs)/index.tsx` หน้าตรวจสอบแบบเรียลไทม์
- `src/app/(tabs)/history.tsx` ประวัติการเดินทาง
- `src/app/session/[id].tsx` สรุปและ Replay
- `app.json` ข้อมูลแอป Android และ splash screen
- `eas.json` โปรไฟล์ APK/AAB
