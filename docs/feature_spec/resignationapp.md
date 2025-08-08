# Feature Specification: Employee Resignation Application

## 1️ Objective

The goal of this feature is to provide employees with an online resignation application process, where they can submit their resignation request through a form. The system will validate the input and notify the HR team for further review and approval.

---

## 2️ System Menu Changes

A new menu item will be added:

- **Submit Resignation Application**  
  → Allows employees to initiate a resignation request directly.

Submitted resignation requests will be integrated into existing views:

- **My Applications** – for employees to track their submissions  
- **Review Applications** – for HR reviewers to see pending requests  
- **History** – for all past applications including leave and resignation

---

## 3️ Functional Requirements

### a. Resignation Form Fields

When an employee chooses to submit a resignation request, the system will display a form with the
following fields:

| No. | Field Name          | Description                                                              | Type         |
|-----|---------------------|--------------------------------------------------------------------------|--------------|
| 1   | Last Working Day    | Employee must select/enter their proposed last working day.              | Date picker  |
| 2   | Reason for Leaving  | Optional field for employees to state their reason for resignation.      | Text input   |
| 3   | Rule 1   | Access and Systems                 | Text     |
| 4   | Rule 2   | Benefits                      | Text     |
| 5   | Rule 3   | Timekeeping Deductions                            | Text    |
| 6   | Password Confirmation | Employee must enter their current account password for validation.      | Password field |

---

### Offboarding Information

#### 📂 Access and Systems

- Access to confidential, proprietary, or sensitive company information will be revoked upon resignation.  
- All company accounts and systems will be deactivated as of the employee’s last working day.

#### 💼 Benefits

- Participation in the company’s group benefits plan will end on the last working day.  
- Any outstanding premiums before the last day will be deducted from the final pay.  
- The company is not responsible for any claims, reimbursements, or disputes related to benefits coverage after the final working day.

#### 🕒 Timekeeping Deductions

- Final pay will be adjusted based on timekeeping records (e.g., late arrivals or early departures).  
- Accumulated time will be rounded down to the nearest hour.  
  - E.g., if total time is 1.75 hours → 1 hour deducted.  
  - If 3.2 hours → 3 hours deducted.

---

### b. Form Submission Flow

- Form submission is allowed **only if**:
  - All required fields are filled
  - Password is validated against the database

- Upon successful submission:
  - Notification email sent to HR
  - Request status set to **Pending**

---

### c. HR Review Process

- HR can log in and review pending resignation requests
- HR marks the request as **Reviewed** once completed

---

## 4️⃣ Notifications

Email to HR should include:

- Employee name
- Last working day
- Reason for leaving
- Submission timestamp
- Direct link to review the request

---

## 5️⃣ Status Definitions

| Status         | Description                                         |
|----------------|-----------------------------------------------------|
| Pending Review | Resignation request submitted, awaiting HR review   |
| Reviewed       | HR has reviewed the resignation request             |

---
