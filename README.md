# DISHA — Your Hospital, Simplified.

> **Accessible, Multilingual, Low-Bandwidth Patient Navigation and Digital Queue Management Platform for Overcrowded Indian Government Hospitals.**

Built for the Microsoft Hackathon.

---

## 🏥 Problem Statement & Vision

Indian public healthcare institutions (district hospitals, civil hospitals, and medical colleges) face severe patient crowding, labyrinthine multi-floor infrastructure, language barriers, and non-transparent queue progression. Elderly citizens, first-time hospital visitors, and individuals with limited digital literacy often struggle to navigate complex corridors, miss their called tokens, or wait in the wrong wings for hours.

**DISHA** transforms overcrowded public hospitals into transparent, accessible, and self-guided healthcare environments through:
- **Zero-Barrier Guest Access**: Never mandates Aadhaar, mobile OTPs, or passwords to navigate or track queues.
- **7 Regional Indian Languages**: Instant toggle across Hindi, Punjabi, Bengali, Marathi, Tamil, Telugu, and English.
- **Dijkstra-Powered Indoor Hospital Navigation**: Interactive 3-floor SVG floor plan with wheelchair mode (lifts only, zero stairs) and checkpoint QR code localization.
- **Real-Time Synchronized Queue Engine**: Socket.IO synchronization between consultation rooms, kiosks, and patient devices.
- **Smart Wait Assistant**: Informs patients of waiting time and suggests nearby amenities (drinking water, accessible toilets) without risking missed tokens.
- **Speech & Senior Citizen Accessibility**: Web Speech API voice guidance, WCAG 2.2 AA compliance, and an Ultra-Simple 4-card mode.
- **Caregiver Connect**: Shareable, consent-based, read-only link for family members to follow journey progress without exposing medical records.
- **Full Hospital Operations Portal**: Live caller console, counter management, Recharts analytics, printable wall QR checkpoints, and operational CSV export.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, React Router v7, i18next, Recharts |
| **Backend** | Node.js, Express.js, Socket.IO, SQLite (`sql.js` WebAssembly engine, zero C++ build dependencies required) |
| **Speech & Hardware** | Web Speech API (SpeechRecognition + SpeechSynthesis) with voice speed controls (0.8x - 1.2x) |
| **Storage & Caching** | LocalStorage (preferences), IndexedDB (offline hospital maps & routes), Service Worker PWA cache |
| **Verification & Security** | JWT Authentication, Parameterized SQLite queries, 19 automated integration tests |

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Node.js** (v18, v20, v22, or v24)
- **npm** (v9+)

### Installation & Launch

```bash
# 1. Install root dependencies
npm install

# 2. Seed database with realistic demonstration data (Disha Demo Government Hospital)
npm run seed

# 3. Start full-stack development environment (Frontend + Backend concurrently)
npm run dev
```

The application will be live at:
- **Patient Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend REST & Socket.IO**: [http://localhost:3001](http://localhost:3001)
- **Backend Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🧪 Automated Testing & Verification

Run the comprehensive automated test suite (verifying Dijkstra algorithm, wheelchair route filtering, queue token collisions, lifecycle states, and JWT security):

```bash
npm test
```

Expected result:
```text
--- STARTING DISHA AUTOMATED TEST SUITE ---
  ✓ PASS: Finds route from Main Entrance to General OPD
  ✓ PASS: Route contains turn-by-turn steps
  ✓ PASS: Calculated distance: 103m
  ✓ PASS: Finds wheelchair-accessible route to First Floor Lab
  ✓ PASS: Wheelchair route correctly selects Elevator Lift A
  ✓ PASS: Wheelchair route strictly excludes Staircase A
  ✓ PASS: Generates queue token
  ✓ PASS: Token has correct department prefix (LAB-001)
  ✓ PASS: Initial token status is "waiting"
  ✓ PASS: Successfully called next patient
  ✓ PASS: Called token status changed to "called"
  ✓ PASS: Assigned designated counter number
  ✓ PASS: Successfully marked token as completed
  ✓ PASS: Successfully marked token as missed
  ✓ PASS: Retrieves patient token info for OPD-024
  ✓ PASS: Generates secure JWT token
  ✓ PASS: JWT verification validates payload integrity
===============================================
  TEST RESULTS: 19 Passed, 0 Failed
===============================================
```

To build production bundles:
```bash
npm run build
```

---

## 🎯 Hackathon Demo Mode (Judge Guide)

To test the platform immediately:

1. Open [http://localhost:5173](http://localhost:5173).
2. Click the floating **"Try Demo (Judge Mode)"** button in the bottom-left corner, or click **"Try Demo"** on the landing hero.
3. The demo preloads the judge patient:
   - **Hospital**: Disha Demo Government Hospital
   - **Patient**: Ramesh Kumar (Demo Patient)
   - **Queue Token**: `OPD-024`
   - **Current Serving**: `OPD-020`
   - **Journey**: Registration (Done) → General OPD (Current) → Pathology Lab (Upcoming) → Pharmacy (Upcoming)
4. Use the **Judge Control Panel** drawer to:
   - **Advance Queue**: Moves the queue forward by one token, triggering real-time Socket.IO alerts.
   - **Call OPD-024**: Simulates the doctor counter calling token `OPD-024`, triggering speech synthesis and audio chime alerts.
   - **Wheelchair Route**: Automatically reroutes paths through Elevator Lift A and avoids Staircase A.
   - **Scan Checkpoint QR**: Tests indoor location localization by selecting any simulated corridor checkpoint.
   - **Simulate Offline**: Cuts network simulation to test cached offline floor plans.
   - **Reset Demo**: Restores the database back to pristine initial state anytime.

---

## 🔐 Demonstration Staff Credentials

| Role | Username | Password | Access Scope |
|---|---|---|---|
| **Hospital Administrator** | `admin` | `disha2026` | Full Hospital Analytics, Counter Management, CSV Export |
| **OPD Doctor** | `doctor_opd` | `staff123` | General OPD Queue Caller, Counter 1 Console |
| **Lab Technician** | `lab_tech` | `staff123` | Pathology Laboratory & Phlebotomy Counter |
| **Pharmacist** | `pharmacist` | `staff123` | Jan Aushadhi Generic Medicine Dispensary |
| **Receptionist** | `reception` | `staff123` | Registration & Inquiry Desk |

Login page: [http://localhost:5173/admin/login](http://localhost:5173/admin/login) (includes 1-click Quick-Fill buttons).

---

## 🗺️ Demonstration Hospital Layout (3 Floors)

### Ground Floor (0)
- **Main Entrance & Ramp**: Entry with security and wheelchair ramp
- **Central Atrium Lobby**: Foyer connecting all wings
- **Help Desk & Inquiry**: Wheelchair assistance and token marshals (Room G-00)
- **Registration Counter**: Counters 1–4 (Room G-01)
- **General OPD**: Consultation Room G-12
- **Emergency Department**: Casualty Ward G-EM (24x7)
- **Pharmacy (Jan Aushadhi)**: Free generic medicine dispensary (Room G-08)
- **Accessible Restrooms**: Divyangjan and senior citizen friendly
- **Drinking Water Station**: Purified cold and normal water
- **Hospital Canteen**: Clean refreshments and snacks
- **Elevator Lift A**: Stretcher and wheelchair friendly lift to Floors 1 & 2
- **Staircase A**: Non-accessible stairs to Floors 1 & 2

### First Floor (1)
- **Pathology Laboratory**: Clinical investigations (Room 1-05)
- **Blood Sample Collection**: Phlebotomy counters (Room 1-06)
- **Radiology & Ultrasound**: Sonography & CT desk (Room 1-14)
- **X-Ray Department**: Digital radiography (Room 1-16)
- **First Floor Waiting Lounge**: Report collection seating
- **First Floor Restrooms & Water Cooler**

### Second Floor (2)
- **Specialist OPD**: Senior physician clinic (Room 2-01)
- **Orthopaedics**: Joint and plaster room (Room 2-08)
- **Cardiology & ECG**: Heart screening clinic (Room 2-15)
- **ENT Clinic**: Ear, Nose, Throat consultation (Room 2-20)
- **Follow-up Counter**: Discharge review & slot booking (Room 2-00)
- **Second Floor Restrooms & Water Cooler**

---

## 📱 Accessibility & Inclusive Design (WCAG 2.2 AA)

1. **Large Text Mode**: One-click enlargement of interface text.
2. **High Contrast Mode**: Crisp dark backgrounds with bright teal and white contrast borders.
3. **Reduced Motion**: Disables non-essential animations to conserve low-bandwidth data and battery.
4. **Simple Mode**: Ultra-simplified interface for elderly patients with 4 oversized touch cards:
   - *My Next Stop*
   - *My Token*
   - *Speak Directions*
   - *Get Help*
5. **Web Speech API**: Speaks navigation turns, queue updates, and answers queries ("Where is the pharmacy?", "What is my wait time?") in English and regional Indian languages.

---

## 🔒 Security & Privacy Architecture

- **No Sensitive Identity Harvesting**: Aadhaar numbers, biometric data, and full clinical records are never collected.
- **Access Tokens**: Unguessable cryptographically random tokens (`DSH-XXXX`) protect visit passes.
- **Caregiver Connect Privacy Barrier**: Family share links provide queue updates and next stops only; clinical diagnoses and lab test results are strictly excluded.
- **Zero Public Caching**: Public Service Worker caches only static assets; patient tokens and private visits are never saved in shared service-worker caches.

---

## ⚠️ Known Limitations & Future Scope

- **Indoor Positioning**: Operates via corridor QR checkpoints and manual station selection; does not require expensive Bluetooth BLE beacons or Wi-Fi RTT hardware.
- **Speech Recognition**: Voice recognition requires browser Web Speech API support (Google Chrome / Edge recommended). Visual text and one-tap button fallbacks are provided for unsupported browsers.
- **Database**: Runs locally on WebAssembly SQLite (`sql.js`) for zero-configuration hackathon evaluation. Production deployment can migrate to PostgreSQL or distributed Cloud SQL without changing API contracts.

---

*DISHA — Developed for the Microsoft Hackathon. Empowers every citizen to navigate public hospitals with dignity, clarity, and ease.*
