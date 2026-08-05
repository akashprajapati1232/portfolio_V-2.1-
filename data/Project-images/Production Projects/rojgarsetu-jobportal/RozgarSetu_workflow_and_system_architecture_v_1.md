# Workforce Hiring Portal – System Workflow & Architecture (V1)

## Project Overview

This platform is a workforce hiring ecosystem where:

- Workers / Job Seekers can create verified profiles and apply for jobs.
- Businesses / Employers can post job requirements and hire workers.
- Partners can register workers in bulk and manage workforce registrations.
- Admin controls verification, job approvals, worker approvals, payments, and platform operations.

The platform is designed mainly for blue-collar and semi-skilled workforce hiring such as:

- Electrician
- Driver
- Delivery Boy
- Helper
- Welder
- Office Staff
- Cook
- Factory Worker
- Construction Worker
- Data Entry Operator

---

# User Roles

## 1. Admin

The Admin has complete control over the platform.

### Admin Responsibilities

- Verify Workers
- Verify Businesses
- Verify Partners
- Approve Jobs
- Manage Wallets
- Manage Worker Applications
- Handle Final Hiring Deals
- View Platform Reports
- Manage Fraud & Duplicate Accounts

---

## 2. Worker / Job Seeker

Workers can:

- Register themselves
- Complete profile
- Upload KYC documents
- Add skills and education
- Add bank details
- Apply for jobs
- Track application status

---

## 3. Business / Employer

Businesses can:

- Register company account
- Complete company KYC
- Post job requirements
- View worker applications
- Coordinate with admin
- Hire workers

---

## 4. Partner

Partners are manpower suppliers or contractors who can register workers on behalf of workers.

### Partner Features

- Register workers
- Wallet recharge system
- Bulk workforce onboarding
- Track worker status
- View registered workers

---

# Platform Workflow

# Worker Self Registration Flow

```text
Worker Registration
       ↓
Enter Basic Details
       ↓
Mobile + Email OTP Verification
       ↓
Pay ₹50 Registration Fee
       ↓
Worker Account Created
       ↓
Worker Login
       ↓
Complete Profile
       ↓
Admin Verification
       ↓
Verified Worker
       ↓
Apply for Jobs
```

---

# Partner Worker Registration Flow

```text
Partner Login
      ↓
Add Worker
      ↓
Fill Worker Basic Details
      ↓
OTP Verification
      ↓
₹30 Deduct From Partner Wallet
      ↓
Worker Account Created
      ↓
Worker Login Independently
      ↓
Complete Profile
      ↓
Admin Verification
```

---

# Business Registration Flow

```text
Business Registration
       ↓
Email + Mobile OTP Verification
       ↓
Business Dashboard Access
       ↓
Complete Company Profile
       ↓
Upload Company KYC
       ↓
Admin Verification
       ↓
Approved Business
       ↓
Post Jobs
```

---

# Worker Profile Completion Structure

## Section 1 – Personal Details

Workers must provide:

- Full Name
- Father Name
- Date of Birth
- Gender
- Address
- State
- District
- Pincode
- Email ID
- Mobile Number

---

## Section 2 – KYC Documents

### Mandatory Documents

#### Aadhaar Card

- Front Image
- Back Image

#### eShram Card

- Front Image
- Back Image

#### PAN Card

- Front Image

---

## Section 3 – Skills & Experience

### Skill Examples

- Electrician
- Driver
- Welder
- Cook
- Office Staff
- Helper
- Factory Worker
- Delivery Boy

### Additional Information

- Work Experience
- Expected Salary
- Preferred Location
- Languages Known

---

## Section 4 – Education Details

Workers can add:

- 10th
- 12th
- ITI
- Diploma
- Graduation
- Certification Courses

---

## Section 5 – Bank Verification

### Required Fields

- Account Holder Name
- Account Number
- Confirm Account Number
- IFSC Code
- Bank Name
- Branch Name
- Mobile Number Linked With Bank
- Passbook / Cancelled Cheque Photo

---

# Worker Status System

| Status | Meaning |
|---|---|
| Registered | Basic account created |
| OTP Verified | Mobile & email verified |
| Profile Pending | KYC not completed |
| Under Review | Admin verification pending |
| Verified | Worker approved |
| Rejected | Invalid information/documents |
| Suspended | Account blocked |

---

# Created By System

## Self Registered Worker

Dashboard will show:

```text
Created By : Self
```

---

## Partner Registered Worker

Dashboard will show:

```text
Created By : Partner Name
```

Example:

```text
Created By : Rahul Partner
```

---

# Business / Employer KYC Structure

## Required Documents

- Aadhaar Front
- Aadhaar Back
- PAN Card
- Office / Shop Photo
- Owner Selfie

---

## Optional Documents

- GST Certificate
- MSME Certificate
- Shop License

---

# Business Job Posting Flow

```text
Business Creates Job
        ↓
Admin Reviews Job
        ↓
Approve / Reject
        ↓
Job Goes Live
        ↓
Workers Can Apply
```

---

# Job Fields Structure

Businesses must enter:

- Job Title
- Worker Type
- Salary
- Experience Required
- Skills Required
- Job Location
- Timing
- Gender Preference
- Number of Workers Required
- Accommodation Availability
- Food Availability
- Job Description

---

# Worker Job Application Flow

```text
Worker Applies for Job
          ↓
Admin Receives Application
          ↓
Admin Talks With Worker
          ↓
Admin Talks With Business
          ↓
Final Deal Confirmation
          ↓
Hiring Completed
```

---

# Partner Wallet System

## Wallet Recharge Flow

```text
Partner Adds Money
         ↓
Wallet Balance Updated
         ↓
Partner Registers Worker
         ↓
₹30 Deducted Per Worker
```

---

# Registration Charges

| Registration Type | Amount |
|---|---|
| Direct Worker Registration | ₹50 |
| Partner Worker Registration | ₹30 (wallet deduction) |

---

# Important Business Logic

## Worker View

All workers will see:

```text
Registration Fee = ₹50
```

Partner internal pricing remains hidden.

---

# Admin Verification System

## Admin Can Verify

### Workers

- Aadhaar
- eShram
- PAN
- Selfie
- Bank Details

### Businesses

- Company documents
- Office proof
- Owner identity

### Partners

- Identity verification
- Wallet activity
- Worker registrations

---

# Security Features

## Important Validations

### Worker Security

- One mobile number = One worker account
- Duplicate Aadhaar restriction
- OTP verification mandatory

---

### Business Security

- Admin approval required before posting jobs
- Fraud business detection

---

### Partner Security

- Wallet deduction tracking
- Worker ownership history
- Duplicate registration monitoring

---

# Worker Ownership Rules

Partners can:

- Register workers
- Help workers complete onboarding

Partners cannot:

- View worker passwords
- Delete worker accounts
- Control worker account permanently

Workers remain independent users.

---

# Suggested Dashboard Modules

# Worker Dashboard

- Complete Profile
- Upload KYC
- Add Skills
- Add Education
- Add Bank Details
- Browse Jobs
- Apply Jobs
- Track Application Status

---

# Business Dashboard

- Complete Company Profile
- Upload Company KYC
- Post Jobs
- Manage Jobs
- View Applicants
- Hiring Status

---

# Partner Dashboard

- Wallet Balance
- Add Worker
- Worker List
- Recharge Wallet
- Registration History

---

# Admin Dashboard

- Total Workers
- Total Businesses
- Total Partners
- Pending KYC
- Pending Jobs
- Active Jobs
- Wallet Transactions
- Hiring Reports

---

# Recommended Technology Stack

## Frontend

- HTML5
- Bootstrap 5
- Tailwind CSS
- JavaScript
- AJAX

---

## Backend

- PHP 8
- MySQL

Alternative:

- Node.js + Express

---

## Database

- MySQL

---

## File Storage Structure

```text
uploads/
   workers/
      aadhaar/
      eshram/
      pan/
      bank/
      selfie/

   businesses/
      aadhaar/
      pan/
      office/

   partners/
      aadhaar/
      pan/
```

---

# Suggested Database Tables

## Worker Tables

- workers
- worker_kyc
- worker_skills
- worker_education
- worker_bank_details
- worker_applications

---

## Business Tables

- businesses
- business_kyc
- jobs

---

## Partner Tables

- partners
- partner_wallet
- wallet_transactions

---

## Admin Tables

- admins
- activity_logs
- verification_logs

---

# Future Upgrade Features

## Phase 2

- OCR Document Reading
- Auto IFSC Detection
- Resume Upload
- Notification System

---

## Phase 3

- DigiLocker Integration
- Face Match Verification
- AI Skill Matching
- Geo-location Based Jobs

---

## Phase 4

- Mobile App
- Video Interviews
- Salary Transfer System
- Referral System
- Commission System

---

# Final Platform Objective

The objective of this platform is to create a trusted workforce hiring ecosystem where:

- Workers can find verified jobs.
- Businesses can hire verified workers.
- Partners can onboard manpower efficiently.
- Admin maintains trust, security, and hiring management.

This system combines:

- Job Portal
- Manpower Supply System
- Labor Marketplace
- Workforce Verification Platform

into one scalable hiring ecosystem.

