# FINAL GROUP PROJECT: ANDROID APPLICATION DEVELOPMENT
## SmartOnse Mobile v2.0 — Barangay Onse Digital E-Governance Application

- **Course**: Application Development and Emerging Technologies
- **Project Title**: SmartOnse (Barangay Onse Digital E-Governance & Resident Services Portal)
- **Platform**: Android Studio (Min SDK 24 / Target SDK 36)
- **Programming Language**: Kotlin (100% Native Android Activities & XML UI)
- **Data Architecture**: Predefined Static Sample Data (`SampleDataRepository.kt`) — No External Database Required

---

## I. Application Overview & Alignment with Capstone 2 Website

**SmartOnse Mobile** is the native Android mobile counterpart of our **Capstone 2 Website** (*SmartOnse: Barangay Onse Digital E-Governance Website, San Juan City*).

It reproduces the website's core maroon-and-gold visual identity (`#800000` / `#F59E0B`), official Barangay Onse seal, and primary citizen e-governance workflows in a mobile-friendly native Android interface using **TextView, EditText, Button, ImageView, CardView, Spinner, CheckBox, and ScrollView**, connected via **Explicit Intents**.

---

## II. Implemented Screens (7 Native Kotlin Activities)

| Screen # | Activity (`Kotlin`) | Layout XML | Purpose & Capstone 2 Website Counterpart |
| :--- | :--- | :--- | :--- |
| **1. Home Screen / Dashboard** | `MainActivity.kt` | `activity_main.xml` | Reproduces the SmartOnse Home Landing Page (`/`). Displays the Barangay Onse Seal (`ImageView`), key population/voter statistics (`CardView`), quick-action CTAs, a recent sample tracking preview card, and 4 navigation cards using **Explicit Intents**. |
| **2. E-Services Catalog & Search** | `ServicesActivity.kt` | `activity_services.xml` | Reproduces the Barangay Services page (`/services`). Lists 6 predefined Barangay certificates/clearances with real-time keyword search (`EditText` + `TextWatcher`) and category filter buttons (`General & Civil`, `Welfare & Youth`, `Business Permits`). |
| **3. Service Details Screen** | `ServiceDetailActivity.kt` | `activity_service_detail.xml` | Receives the selected service ID via `Intent.getStringExtra("EXTRA_SERVICE_ID")` and displays full service description, processing fee, turnaround time, and numbered documentary requirements. |
| **4. Certificate Request Form** | `RequestFormActivity.kt` | `activity_request_form.xml` | Reproduces the Resident Document Request Portal (`/portal/request`). Includes `Spinner`, `EditText`, `CheckBox`, an **Auto-Fill Sample Resident** demo button, and 7-point Kotlin input validation. |
| **5. Confirmation & Receipt Screen** | `ConfirmationActivity.kt` | `activity_confirmation.xml` | Receives validated submission data via **Explicit Intent extras**, generates a sequential tracking code (e.g., `ONSE-2026-0004`), computes the total fee, and saves the request to `SampleDataRepository.trackingRecords`. |
| **6. Real-Time Document Tracker** | `TrackDocumentActivity.kt` | `activity_track_document.xml` | Reproduces the Document Tracker page (`/track`). Allows searching any predefined or newly submitted tracking number (`ONSE-2026-0001` to `ONSE-2026-0004+`) with clickable sample record chips. |
| **7. About & Officials Directory** | `AboutOfficialsActivity.kt` | `activity_about_officials.xml` | Reproduces the `/about` and `/officials` pages. Displays Barangay Onse Hall information, statutory compliance (R.A. 11032 & R.A. 10173), and a filterable directory of Barangay Council & SK Officials. |

---

## III. Explicit Intent & Navigation Storyboard

```text
[1. MainActivity (Home Dashboard)]
   ├── Explicit Intent ──> [2. ServicesActivity (Search & Category Filter)]
   │                          ├── Explicit Intent (EXTRA_SERVICE_ID) ──> [3. ServiceDetailActivity]
   │                          │                                              └── Explicit Intent ──> [4. RequestFormActivity]
   │                          └── Explicit Intent (EXTRA_SERVICE_TITLE) ───────────────────────────> [4. RequestFormActivity]
   │
   ├── Explicit Intent ──> [4. RequestFormActivity (Input Validation & Event Handling)]
   │                          └── Explicit Intent (EXTRA_TRACKING_NUMBER, Applicant Data) ──> [5. ConfirmationActivity]
   │                                                                                             └── Explicit Intent ──> [6. TrackDocumentActivity]
   │
   ├── Explicit Intent ──> [6. TrackDocumentActivity (Sample Data Lookup)]
   │
   └── Explicit Intent ──> [7. AboutOfficialsActivity (Barangay & SK Council Directory)]
```

---

## IV. Input Validation & Event Handling (`RequestFormActivity.kt` & `TrackDocumentActivity.kt`)

1. **Full Name Validation**: Rejects empty input or names shorter than 4 characters (`etFullName.error`).
2. **Philippine Mobile Number Validation**: Regex validation (`^09\d{9}$`) ensuring an exact 11-digit mobile number starting with `09`.
3. **Residential Address Validation**: Ensures a valid Barangay Onse street address (minimum 6 characters).
4. **Years of Residency Validation**: Numeric range check (`1` to `100` years).
5. **Purpose of Request Validation**: Rejects empty or vague purposes shorter than 5 characters.
6. **Copy Count Policy Limit**: Enforces the Barangay Onse policy cap of `1` to `5` copies per submission.
7. **R.A. 10173 Data Privacy Consent**: Requires the Data Privacy `CheckBox` to be checked before submission.
8. **Tracker Lookup Validation**: Validates empty or non-existent tracking numbers in `TrackDocumentActivity.kt` and displays a clear error banner.

---

## V. Why Sample Data is Used Instead of an External Database

In accordance with **Section I & II (Requirement #4 & #10)** of the course guidelines:
- All data is stored in [`SampleDataRepository.kt`](../android/app/src/main/java/ph/gov/barangayonse/smartonse/SampleDataRepository.kt) using Kotlin `data class` models (`BarangayServiceItem`, `OfficialItem`, `TrackingRecord`).
- This allows the Android application to run **100% offline** on any Android Studio Emulator or physical Android device during classroom grading and live demonstrations without requiring database credentials or internet connectivity, while still supporting live interactive search, filtering, form submission, fee computation, and tracking number lookup within the app session.
