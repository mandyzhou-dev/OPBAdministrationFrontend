# Registration Patch Document

---

## 1. Overview

This patch improves the **employee registration flow** in the OPB system.  
The goal is to provide clearer error messaging, smoother user experience, and improved onboarding communication for newly registered employees.

---

## 2. Changes Included in This Patch

### 2.1 Improve Error Messaging //DONE

Previously, error prompts were generic and insufficient, causing confusion and repeated user attempts.

**Update:**

- Replace all generic messages such as **"Registration failed"** with detailed, actionable error messages.
- Examples:(TODO)
  - “Email already exists. Please contact HR if you believe this is an error.”
  - “The verification code you provided does not match our records. Please check the mail”

**Impact:**

- Users immediately understand the cause of failure.  
- Reduces support tickets caused by unclear error info.

---

### 2.2 User Experience Enhancement(TODO)

We replace system modals with **Gluestack UI** components to ensure consistent cross-platform UI experience.

**Impact:**

- More unified visual style across iOS / Android.  
- Smoother animations & accessibility improvements.  
- Eliminates platform-specific visual inconsistencies.

---

### 2.3 Improve Birthdate Parsing (Replace Regex with Dayjs) //DONE

The previous birthdate formatter used a regex to split the date, which could not properly validate or handle different input formats.  
This patch replaces the regex logic with **Dayjs**, allowing the system to correctly parse common formats such as:

- YYYYMMDD  
- YYYY-MM-DD  
- YYYY/MM/DD  

Dayjs automatically handles date validation and formatting.

### 2.4 Employee Notification Email with credentials//TODO

Upon successful registration, the system now sends employee credentials via email instead of on-screen display.

**Email Template :**

**Subject:** Welcome to OPB – Your Account Has Been Created

**Body:**

```Hi {nickname},

Your employee account has been created successfully!

Please log in to openbox.brimon.ca using the following credentials.
Here are your login credentials:
Username: {username}
Password: {password}

Once HR assigns you to a group that fits your role, your work shifts will become available in the system.

If you encounter any issues, please contact the IT Support Team.
.

Welcome aboard!

Best regards,
Mandy
```

### 2.5 HR Notification Email After Successful Registration//TODO

After the employee completes registration, the system will automatically send an email notification to the HR team.  
The purpose is to remind HR to review the employee information, assign the employee to the correct group (e.g., Surrey), and fill in their "Big Day" record.

**HR Notification Email Template:**

**Subject:** New Employee Registration Completed – Action Required

**Body:**

Hello HR Team,

A new employee {name} has successfully completed the registration process in the OA system.

Please review the employee information and assign them to the appropriate group (e.g., Surrey).
Also, remember to fill in their "Big Day" details.

You can proceed by visiting the HR Portal at <https://openbox.brimon.ca/>

For onboarding purposes, the employee’s username for logging in to the system is listed below.
username:{username}
For security reasons, the password cannot be shared with HR or any third party.  
If the employee forgets their password or cannot log in, please contact the IT Support Team to reset it to the default temporary password "1234".

Thank you,
Mandy
