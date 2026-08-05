# 🇮🇳 RozgarSetu (रोजगार सेतु) — Workforce Hiring Portal

RozgarSetu is a premium, professional, mobile-first workforce hiring ecosystem designed to connect verified **Workers / Job Seekers (श्रमिक)**, **Businesses / Employers (व्यापार)**, and **Contractor Partners (साझेदार)**. Inspired by Digital India and Skill India initiatives, this platform bridges the employment gap with security, trust, and simplicity.

Optimized extensively for mobile devices (which represent ~95% of the target user base) and sporting a rich bilingual experience (mix of English and Hindi Devanagari), the portal feels extremely modern, fast, and high-fidelity.

---

## 📸 Project Showcase & Branding
* **Tagline:** Bridging Skills to Opportunities | Empowering India's Workforce (कौशल को अवसर से जोड़ना)
* **Design Philosophy:** Premium typography (Poppins + Inter), soft modern shadows, vibrant gradients, HSL custom color tokens, glassmorphism, and smooth micro-animations.
* **Core Brand Identity:**
  
  ![RozgarSetu Favicon](assets/images/favicon.png)

---

## 🚀 Key Highlights & UI Features

- **📱 Mobile-First Responsive Design:** Large, touch-friendly tap targets, sticky navigation, card-based responsive grids, and layout scaling optimized for low-end to high-end mobile devices.
- **🇮🇳 Bilingual Readable UI:** Seamless mixture of Hindi Devanagari and English for comfortable readability across diverse Indian demographics.
- **🎨 Premium Vanilla CSS Architecture:** Avoids Tailwind CSS bloated classes; instead leverages a structured design system utilizing Bootstrap 5 grid layout utility classes alongside custom-scoped, state-of-the-art Vanilla CSS styling.
- **✨ Active Page Navigational Tracking:** Smart navigation tracking on the backend (`basename($_SERVER['PHP_SELF'])`) to automatically highlight active links with accent glow lines.
- **📈 Dynamic Stats Counters:** Animated count-up numbers triggered when registration statistics scroll into view.
- **🎭 Smooth Micro-Animations:** Custom CSS card-hover transitions and **AOS (Animate on Scroll)** integration for a fluid, reactive browsing experience.
- **🔒 KYC & Trust Visualizers:** Includes dedicated sections showcasing mock digital wallets, transaction tables, tier commission ledgers, and secure Aadhaar / eShram document verification workflows.

---

## 📂 Project Architecture & Directory Structure

The project has been organized into a robust, clean, and scalable structure using reusable PHP layouts:

```text
RozgarSetu/
├── index.php             # Core homepage (Hero, Stats, Process steps, Role cards, Testimonials, FAQs)
├── about.php             # Company story, Mission, Vision, and Multi-layered Trust framework
├── worker.php            # Worker registration guide, Aadhaar & eShram KYC document visualizers
├── business.php          # B2B Employer hub, dynamic live candidate listings, hiring preview tables
├── partner.php           # Contractor wallet ledger, Silver/Gold/Platinum tiers, commission growth
├── contact.php           # Fully-styled, interactive submission form, working hours, and map section
├── privacy-policy.php    # Privacy parameters (KYC protection, Aadhaar hashing, cookies index)
├── terms-condition.php   # Detailed service parameters, wallet refunds, liability rules
│
├── includes/             # Reusable PHP templates loaded dynamically across all pages
│   ├── header.php        # Head metadata, Poppins & Inter web fonts, AOS styles, and custom Favicon links
│   ├── navbar.php        # Dynamic active status tracking navbar with sticky dark theme backdrop
│   └── footer.php        # 4-Column responsive footer containing Quick links, legal indices, and trust badges
│
└── assets/               # Local front-end stylesheets, scripting, and media assets
    ├── css/
    │   └── style.css     # Core Design System, responsive media queries, variables, and animations
    ├── js/
    │   └── main.js       # Main interaction script (AOS init, active counter logic, back-to-top handler)
    └── images/
        ├── favicon.png   # Custom vector logo featuring stylized handshake & bridge motif
        ├── hero_homepage.png  # Diverse Indian workforce digital network hero illustration
        ├── hero_about.jpeg    # High-contrast tri-color Digital India & Skill India bridge concept
        ├── hero_worker.png    # Worker candidates checking jobs with eShram verified checkmarks
        ├── hero_business.png  # B2B recruitment dashboard, analytics graph pipelines
        └── hero_partner.png   # Contractor wallet map network of India
```

---

## 🛠️ Technology Stack

- **Server-side Environment:** PHP 8
- **Base UI Layout Grid:** Bootstrap 5 (CSS Utilities)
- **Styling Core:** Custom Vanilla CSS (No Tailwind CSS)
- **Interactions & Scripting:** Vanilla JavaScript ES6
- **Animations:** AOS (Animate on Scroll)
- **Iconography:** FontAwesome 6 (Pro & Free CDN integrations)
- **Typography:** Google Fonts (Poppins & Inter)

---

## 💻 How to Run the Project Locally

1. **Install Local Server:** Make sure you have **XAMPP** (or MAMP / WampServer) with **PHP 8+** installed.
2. **Setup Folder Path:** Clone or copy the `RozgarSetu` directory directly inside your Apache's htdocs directory:
   * **macOS:** `/Applications/XAMPP/xamppfiles/htdocs/RozgarSetu/`
   * **Windows:** `C:\xampp\htdocs\RozgarSetu\`
3. **Start Server:** Open your XAMPP Control Panel and start the **Apache Web Server**.
4. **Access Portal:** Open any modern browser and navigate to:
   [http://localhost/RozgarSetu/](http://localhost/RozgarSetu/)

---

## 🏛️ Comprehensive Architecture & Workflow (Future Backend Schema)

### 1. Registration Fee & Partner Commission Structures
- **Direct Worker Registration:** Worker registers independently with a **₹50** one-time verified account charge.
- **Partner Worker Registration:** Contractor adds workers in bulk; **₹30** is deducted from the Partner's Digital Wallet balance. The worker profile is created, and they can login independently using their credentials.

### 2. User Status Lifecycle States
* `Registered` ➔ Basic account created
* `OTP Verified` ➔ Mobile + Email OTP authorization successfully completed
* `Profile Pending` ➔ Core personal details or KYC uploads missing
* `Under Review` ➔ Documents uploaded, awaiting Admin background-check
* `Verified` ➔ Profile approved and live inside employer match filters
* `Rejected` ➔ Document mismatch, profile requires adjustment
* `Suspended` ➔ Account blocked due to policy violations

### 3. Suggested Database Schema (MySQL Architecture)
To scale this portal, the backend utilizes three core database groups:

```mermaid
erDiagram
    WORKERS ||--o| WORKER-KYC : "has documents"
    WORKERS ||--o{ WORKER-APPLICATIONS : "submits"
    BUSINESSES ||--o{ JOBS : "posts"
    JOBS ||--o{ WORKER-APPLICATIONS : "receives"
    PARTNERS ||--o{ WORKERS : "registers"
    PARTNERS ||--o| PARTNER-WALLET : "owns"
    PARTNER-WALLET ||--o{ WALLET-TRANSACTIONS : "logs"

    WORKERS {
        int id PK
        string full_name
        string mobile_number UNIQUE
        string email
        string password_hash
        string created_by_type "Self / Partner"
        int created_by_id "Partner ID if added by partner"
        string status "Registered / Verified / Suspended"
        timestamp created_at
    }

    WORKER-KYC {
        int id PK
        int worker_id FK
        string aadhaar_hash UNIQUE
        string aadhaar_front_path
        string aadhaar_back_path
        string eshram_number UNIQUE
        string eshram_front_path
        string pan_number
        string pan_photo_path
        string selfie_photo_path
        string status "Pending / Approved / Rejected"
    }

    BUSINESSES {
        int id PK
        string company_name
        string contact_person
        string mobile_number UNIQUE
        string office_address
        string owner_selfie_path
        string office_photo_path
        string gstin
        string status "Pending / Approved / Suspended"
    }

    JOBS {
        int id PK
        int business_id FK
        string job_title
        string worker_type "Electrician/Driver/Cook etc"
        decimal salary
        string job_location
        int workers_required
        string status "Draft / Pending / Live / Closed"
    }

    PARTNERS {
        int id PK
        string partner_name
        string agency_name
        string mobile_number UNIQUE
        string identity_proof_path
        string tier "Silver / Gold / Platinum"
        timestamp created_at
    }

    PARTNER-WALLET {
        int id PK
        int partner_id FK
        decimal balance "Current cash pool"
        timestamp last_updated
    }

    WALLET-TRANSACTIONS {
        int id PK
        int wallet_id FK
        decimal amount
        string transaction_type "Credit / Debit"
        string description "Worker Signup / Wallet Top-up"
        timestamp created_at
    }
```

---

## 🔮 Platform Roadmap & Upcoming Phases

### Phase 2: Live Backend Integration
- Implement secure MySQL databases using PDO connections.
- Enable Worker and Partner registration endpoints using mobile SMS OTP gateways.
- Introduce Partner digital wallets integrated with mock Razorpay gateways for top-ups.
- Setup Admin Dashboard for managing KYC reviews (approving / rejecting candidate documents).

### Phase 3: OCR Reading & Automation
- Connect cloud OCR APIs to auto-extract name and registration numbers from Aadhaar and eShram card uploads.
- Auto-extract bank branch details using IFSC verification endpoints.
- AI-based job match scoring according to candidate skills, expected salary, and regional proximity.

### Phase 4: Full Ecosystem Launch
- Launch native Android mobile application wrap.
- Build-in native video interview and shortlisting channels.
- Implement monthly digital payroll transfer integrations for B2B clients hiring through the portal.

---

## 🇮🇳 Powered by Bharat, Designed for Trust
RozgarSetu is designed to empower every contractor, business, and hard-working citizen with technology that is **safe, fast, and accessible**. 

*Designed and engineered with absolute visual excellence.*
