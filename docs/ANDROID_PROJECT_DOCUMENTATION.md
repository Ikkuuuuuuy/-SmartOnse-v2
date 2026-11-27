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

It reproduces the website's core maroon-and-gold visual identity (`#800000` / `#9C2007` / `#F59E0B`), official Barangay Onse seal, real official portraits, and primary citizen e-governance workflows in a mobile-friendly native Android interface using **`TextView`, `EditText`, `Button`, `ImageView`, `CardView`, `Spinner`, `CheckBox`, and `ScrollView`**, connected via **Explicit Intents** and a persistent **5-Tab Bottom Navigation Bar** (`Home` | `About` | `Services` | `Transparency` | `Track`).

---

## II. Implemented Screens (10 Native Kotlin Activities + 2 Core Helpers)

| Screen / File | Kotlin Class (`app/src/main/kotlin/...`) | Layout XML (`app/src/main/res/layout/...`) | Purpose & Capstone 2 Website Counterpart |
| :--- | :--- | :--- | :--- |
| **1. Home Screen** | `MainActivity.kt` | `activity_main.xml` | Reproduces the SmartOnse Home Landing Page (`/`). Displays the Barangay Onse Seal (`ImageView`), quick tracking search bar, key population/scholar statistics (`CardView`), 6 digital portal module cards, featured certificates, and Explicit Intent actions. |
| **2. About & Officials Directory** | `AboutOfficialsActivity.kt` | `activity_about_officials.xml`, `item_official_card.xml` | Reproduces the `/about` and `/officials` pages. Displays the Barangay Onse Civic Profile, population/voter stats (`3,824` & `1,250`), Legal Mandate (`R.A. 7160` & `R.A. 11032`), Vision & Mission, Barangay Hall info, and the 20 Sangguniang Barangay & SK Officials with their real circular portrait photos and dynamic filter tabs (`All (20)` \| `Brgy Council` \| `SK Council`). |
| **3. E-Services Catalog & Search** | `ServicesActivity.kt` | `activity_services.xml`, `item_service_card.xml` | Reproduces the Barangay Services page (`/services`). Lists 6 predefined Barangay certificates/clearances with real-time keyword search (`EditText` + `TextWatcher`) and dynamic category filter buttons (`All Services`, `General & Civil`, `Welfare & Youth`, `Business Permits`). |
| **4. Service Details Screen** | `ServiceDetailActivity.kt` | `activity_service_detail.xml` | Receives the selected service ID via `Intent.getStringExtra("EXTRA_SERVICE_ID")` and displays full service description, processing fee, turnaround time, and numbered documentary requirements. |
| **5. Certificate Request Form** | `RequestFormActivity.kt` | `activity_request_form.xml` | Reproduces the Resident Document Request Portal (`/portal/request`). Includes `Spinner`, `EditText`, `CheckBox`, an **Auto-Fill Sample Resident** demo button, and 7-point Kotlin input validation. |
| **6. Confirmation & Receipt Screen** | `ConfirmationActivity.kt` | `activity_confirmation.xml` | Receives validated submission data via **Explicit Intent extras**, generates a sequential tracking code (`ONSE-2026-XXXX`), computes the total fee, and saves the request to `SampleDataRepository.trackingRecords`. |
| **7. Real-Time Document Tracker** | `TrackDocumentActivity.kt` | `activity_track_document.xml`, `item_tracking_chip.xml` | Reproduces the Document Tracker page (`/track`). Allows searching any predefined or newly submitted tracking number (`ONSE-2026-8891`, `ONSE-2026-0001`, etc.) with clickable sample record chips and a 4-step verification checklist. |
| **8. Transparency, SK & Events Hub** | `TransparencySkActivity.kt` | `activity_transparency_sk.xml` | Reproduces the `/transparency`, `/sk`, and `/events` pages. Features dynamically highlighted sub-tab buttons (`COA Disclosure` \| `SK Programs` \| `Brgy Events`). |
| **9. Resident & Staff Login** | `LoginActivity.kt` | `activity_login.xml` | Reproduces the `/login` page with email/password input validation and a 1-Click Demo Role Switcher (`Resident`, `Punong Barangay`, `Barangay Kagawad`, `SK Chairperson`, `Staff`). |
| **10. OnseBot AI Virtual Desk** | `ChatbotActivity.kt` | `activity_chatbot.xml` | Reproduces the floating `OnseBot AI Assistant` virtual desk using an offline Tagalog/English knowledge base and quick question chips. |
| **Shared Navigation Controller** | `NavigationShellHelper.kt` | `layout_top_navbar.xml`, `layout_bottom_nav.xml`, `dialog_hamburger_menu.xml`, `layout_fab_onsebot.xml` | Powers the persistent 5-tab bottom navigation bar (`Home`, `About`, `Services`, `Transparency`, `Track`), active tab highlighting, floating OnseBot AI button, and custom top-right Maroon Hamburger Dropdown Menu. |
| **Predefined Sample Data Store** | `SampleDataRepository.kt` | — | Stores all Kotlin `data class` models and predefined static sample data (6 services, 20 officials, 8 COA documents, 4 SK programs, 3 events, 4 tracking records) so the app operates 100% offline without a database. |

---

## III. Explicit Intent & Navigation Storyboard

```text
[Persistent 5-Tab Bottom Bar: Home | About | Services | Transparency | Track]
   │
   ├── Tab 1: Home ──────────> [1. MainActivity]
   │                              ├── Explicit Intent ──> [5. RequestFormActivity]
   │                              └── Explicit Intent ──> [7. TrackDocumentActivity]
   │
   ├── Tab 2: About ─────────> [2. AboutOfficialsActivity (Civic Profile + 20 Brgy & SK Officials)]
   │
   ├── Tab 3: Services ──────> [3. ServicesActivity (Search & Category Filter)]
   │                              ├── Explicit Intent (EXTRA_SERVICE_ID) ──> [4. ServiceDetailActivity]
   │                              └── Explicit Intent (EXTRA_SERVICE_ID) ──> [5. RequestFormActivity]
   │                                                                            └── Explicit Intent ──> [6. ConfirmationActivity]
   │                                                                                                       └── Explicit Intent ──> [7. TrackDocumentActivity]
   │
   ├── Tab 4: Transparency ──> [8. TransparencySkActivity (COA Disclosure | SK Programs | Brgy Events)]
   │
   ├── Tab 5: Track ─────────> [7. TrackDocumentActivity (4-Step Document Status Tracker)]
   │
   ├── Top-Right Hamburger ──> [Custom Maroon Dropdown] ──> [9. LoginActivity (Profile & Role Switcher)]
   │
   └── Floating AI Button ───> [10. ChatbotActivity (OnseBot 24/7 Virtual Desk)]
```

---

## IV. Input Validation & Event Handling (`RequestFormActivity.kt`, `LoginActivity.kt`, `TrackDocumentActivity.kt`)

1. **Full Name Validation**: Rejects empty input or names shorter than 4 characters (`etFullName.error`).
2. **Philippine Mobile Number Validation**: Regex validation (`^09\d{9}$`) ensuring an exact 11-digit mobile number starting with `09`.
3. **Residential Address Validation**: Ensures a valid Barangay Onse street address (minimum 6 characters).
4. **Purpose of Request Validation**: Rejects empty or vague purposes shorter than 4 characters.
5. **Copy Count Policy Limit**: Enforces valid copy counts (`1` to `10` copies per submission).
6. **R.A. 10173 Data Privacy Consent**: Requires the Data Privacy `CheckBox` to be checked before submission.
7. **Tracker & Login Input Validation**: Validates empty or non-existent tracking numbers in `TrackDocumentActivity.kt`, email/password rules in `LoginActivity.kt`, and non-empty chat questions in `ChatbotActivity.kt`.

---

## V. Why Sample Data is Used Instead of an External Database

In accordance with **Section I & II (Requirements #4 & #10)** of the course guidelines:
- All data is stored in `SampleDataRepository.kt` (`app/src/main/kotlin/ph/gov/barangayonse/smartonse/SampleDataRepository.kt`) using Kotlin `data class` models (`BarangayServiceItem`, `OfficialItem`, `TrackingRecord`, `TransparencyItem`, `SkProgramItem`, `BarangayEventItem`).
- The `AndroidManifest.xml` declares **zero** internet or database permissions.
- This allows the Android application to run **100% offline** on any Android Studio Emulator or physical Android device during classroom grading and live demonstrations without requiring database credentials or internet connectivity.
