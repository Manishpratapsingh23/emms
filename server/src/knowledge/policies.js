// WorkWise AI - Company Knowledge Base
// These are the default policies that are always available.
// PDF documents uploaded to /server/knowledge_base/ will be processed and added dynamically.

const knowledgeBase = [
  // ==================== LEAVE POLICIES ====================
  {
    id: 'leave-policy-001',
    title: 'Annual Leave Policy',
    category: 'Leave Policies',
    accessLevel: 'all', // 'all', 'employee', 'admin'
    content: `
      Annual Leave Policy - WorkWise AI

      1. ENTITLEMENT:
         - All full-time employees are entitled to 24 days of paid annual leave per calendar year.
         - Part-time employees receive pro-rata leave based on their working hours.
         - Leave entitlement is credited at the beginning of each calendar year.

      2. ACCRUAL:
         - New employees joining mid-year will receive pro-rata leave.
         - Leave accrues at the rate of 2 days per month of service.
         - Unused leave can be carried forward up to a maximum of 5 days to the next calendar year.

      3. APPLICATION PROCESS:
         - Employees must apply for leave at least 3 working days in advance for planned leave.
         - Emergency leave applications will be reviewed on a case-by-case basis.
         - All leave requests must be submitted through the WorkWise AI system.
         - Manager/Admin approval is required before leave is confirmed.

      4. RESTRICTIONS:
         - Maximum consecutive leave cannot exceed 10 working days without special approval.
         - Leave during blackout periods (project deadlines, fiscal year-end) may be restricted.
         - At least 50% of the team must be available at any given time.
    `
  },
  {
    id: 'leave-policy-002',
    title: 'Sick Leave Policy',
    category: 'Leave Policies',
    accessLevel: 'all',
    content: `
      Sick Leave Policy - WorkWise AI

      1. ENTITLEMENT:
         - All employees are entitled to 12 days of paid sick leave per calendar year.
         - Sick leave does not carry forward to the next year.

      2. DOCUMENTATION:
         - For sick leave of 3 or more consecutive days, a medical certificate is required.
         - The medical certificate must be submitted within 2 days of returning to work.

      3. NOTIFICATION:
         - Employees must notify their manager/HR before the start of the workday or as soon as possible.
         - Notification can be made via the WorkWise AI system, email, or phone.

      4. EXTENDED ILLNESS:
         - For illness exceeding 12 days, employees may apply for unpaid medical leave.
         - Extended medical leave requires documentation from a licensed medical practitioner.
    `
  },
  {
    id: 'leave-policy-003',
    title: 'Maternity & Paternity Leave',
    category: 'Leave Policies',
    accessLevel: 'all',
    content: `
      Maternity & Paternity Leave Policy - WorkWise AI

      MATERNITY LEAVE:
      - Female employees are entitled to 26 weeks (182 days) of paid maternity leave.
      - This can be taken up to 8 weeks before the expected delivery date.
      - Additional unpaid leave of up to 12 weeks may be granted upon request.

      PATERNITY LEAVE:
      - Male employees are entitled to 2 weeks (10 working days) of paid paternity leave.
      - This must be taken within 6 months of the child's birth.

      APPLICATION:
      - Maternity leave should be applied at least 4 weeks before the planned start date.
      - Supporting medical documentation is required.
    `
  },
  {
    id: 'leave-policy-004',
    title: 'Casual Leave Policy',
    category: 'Leave Policies',
    accessLevel: 'all',
    content: `
      Casual Leave Policy - WorkWise AI

      1. ENTITLEMENT:
         - All employees are entitled to 6 days of casual leave per calendar year.
         - Casual leave is intended for personal or urgent matters.

      2. RULES:
         - Casual leave cannot exceed 3 consecutive days.
         - Casual leave cannot be combined with other types of leave.
         - Prior approval is preferred but not mandatory for emergencies.
         - Casual leave does not carry forward to the next year.
    `
  },

  // ==================== HR RULES ====================
  {
    id: 'hr-001',
    title: 'Code of Conduct',
    category: 'HR Rules',
    accessLevel: 'all',
    content: `
      Code of Conduct - WorkWise AI

      1. PROFESSIONAL BEHAVIOR:
         - Employees must maintain professional behavior at all times.
         - Harassment, discrimination, or bullying of any kind is strictly prohibited.
         - All employees must treat colleagues with respect and dignity.

      2. DRESS CODE:
         - Business casual dress code applies Monday through Thursday.
         - Casual dress is permitted on Fridays.
         - Client-facing meetings require business formal attire.

      3. WORK HOURS:
         - Standard work hours are 9:00 AM to 6:00 PM with a 1-hour lunch break.
         - Flexible working hours may be arranged with manager approval.
         - Core hours (10:00 AM - 4:00 PM) must be observed by all employees.

      4. COMMUNICATION:
         - Official communication must be done through company channels.
         - Confidential information must not be shared externally.
         - All work-related discussions should be professional and constructive.
    `
  },
  {
    id: 'hr-002',
    title: 'Anti-Harassment Policy',
    category: 'HR Rules',
    accessLevel: 'all',
    content: `
      Anti-Harassment Policy - WorkWise AI

      WorkWise AI is committed to providing a workplace free from harassment.

      DEFINITION:
      - Harassment includes unwelcome verbal, physical, or visual conduct.
      - This covers sexual harassment, bullying, intimidation, and discrimination.

      REPORTING:
      - Employees can report incidents to HR, their manager, or anonymously through the system.
      - All reports are treated confidentially and investigated promptly.
      - Retaliation against reporting employees is strictly prohibited.

      CONSEQUENCES:
      - Substantiated cases will result in disciplinary action up to and including termination.
      - The company may also take legal action where appropriate.
    `
  },
  {
    id: 'hr-003',
    title: 'Performance Review Process',
    category: 'HR Rules',
    accessLevel: 'all',
    content: `
      Performance Review Process - WorkWise AI

      1. REVIEW CYCLE:
         - Performance reviews are conducted bi-annually (June and December).
         - Mid-year reviews focus on progress and goal adjustment.
         - Year-end reviews determine annual ratings and increments.

      2. PROCESS:
         - Self-assessment submitted by employees.
         - Manager assessment and 1-on-1 discussion.
         - HR calibration and final rating.
         - Feedback shared with employees within 2 weeks.

      3. RATINGS:
         - Outstanding (5): Consistently exceeds expectations.
         - Exceeds Expectations (4): Frequently exceeds requirements.
         - Meets Expectations (3): Consistently meets all requirements.
         - Needs Improvement (2): Partially meets requirements.
         - Unsatisfactory (1): Does not meet minimum requirements.

      4. PROMOTION CRITERIA:
         - Minimum 2 consecutive "Exceeds" or 1 "Outstanding" rating required.
         - Must have completed at least 1 year in current role.
         - Manager and HR recommendation required.
    `
  },

  // ==================== PAYROLL RULES ====================
  {
    id: 'payroll-001',
    title: 'Salary Structure & Payroll',
    category: 'Payroll Rules',
    accessLevel: 'all',
    content: `
      Salary Structure & Payroll - WorkWise AI

      1. SALARY COMPONENTS:
         - Basic Salary: 50% of CTC (Cost to Company).
         - House Rent Allowance (HRA): 20% of Basic Salary.
         - Dearness Allowance (DA): 10% of Basic Salary.
         - Special Allowance: Remaining amount.
         - Professional Tax: As per state government rules.
         - Provident Fund (PF): 12% of Basic Salary (employer + employee).

      2. PAY CYCLE:
         - Salaries are processed on the last working day of each month.
         - Payment is made via direct bank transfer (NEFT/RTGS).
         - Salary slips are available for download through the WorkWise AI system.

      3. DEDUCTIONS:
         - Tax Deducted at Source (TDS) as per income tax slabs.
         - Professional Tax as applicable.
         - Provident Fund (PF) contribution.
         - Any other statutory deductions.

      4. OVERTIME:
         - Overtime is applicable only for non-exempt employees.
         - Overtime rate: 1.5x regular hourly rate for weekdays, 2x for weekends/holidays.
         - Overtime must be pre-approved by the manager.
    `
  },
  {
    id: 'payroll-002',
    title: 'Reimbursement Policy',
    category: 'Payroll Rules',
    accessLevel: 'all',
    content: `
      Reimbursement Policy - WorkWise AI

      1. ELIGIBLE EXPENSES:
         - Travel expenses for official business trips.
         - Meal expenses during business travel.
         - Internet/phone bills (up to approved limit).
         - Professional development and certification fees.
         - Work-from-home setup allowance (one-time).

      2. PROCESS:
         - Submit reimbursement claims within 30 days of incurring the expense.
         - Attach original bills/receipts with the claim.
         - Claims are processed within 15 business days of approval.
         - Approved amounts are credited with the next salary cycle.

      3. LIMITS:
         - Meal allowance: Up to $50/day during business travel.
         - Internet reimbursement: Up to $50/month.
         - Professional development: Up to $2,000/year with manager approval.
    `
  },

  // ==================== ATTENDANCE POLICIES ====================
  {
    id: 'attendance-001',
    title: 'Attendance & Punctuality Policy',
    category: 'Company Policies',
    accessLevel: 'all',
    content: `
      Attendance & Punctuality Policy - WorkWise AI

      1. WORKING HOURS:
         - Standard office hours: 9:00 AM to 6:00 PM (Monday to Friday).
         - Core hours: 10:00 AM to 4:00 PM (mandatory presence).
         - Flexible start: Between 8:00 AM and 10:00 AM with manager approval.

      2. CLOCK IN/OUT:
         - All employees must clock in and clock out daily using the WorkWise AI system.
         - Failure to clock in/out will be marked as absent unless corrected within 24 hours.
         - Late arrivals (after 10:00 AM) are recorded; 3 late arrivals = 1 casual leave deducted.

      3. REMOTE WORK:
         - Remote work is permitted up to 2 days per week with manager approval.
         - Employees must be available during core hours even when working remotely.
         - Remote work days must be logged in the system in advance.

      4. ABSENTEEISM:
         - Unapproved absence will result in salary deduction for the day(s) missed.
         - Chronic absenteeism (more than 3 unapproved absences in a month) will trigger a review.
    `
  },

  // ==================== ONBOARDING ====================
  {
    id: 'onboarding-001',
    title: 'New Employee Onboarding Guide',
    category: 'Onboarding Docs',
    accessLevel: 'all',
    content: `
      New Employee Onboarding Guide - WorkWise AI

      Welcome to WorkWise AI! Here's everything you need to get started:

      WEEK 1 CHECKLIST:
      □ Collect your employee ID and access card from HR.
      □ Set up your WorkWise AI account (login credentials provided via email).
      □ Complete your profile in the WorkWise AI system.
      □ Attend the company orientation session.
      □ Review and acknowledge the Code of Conduct.
      □ Set up your workstation and required software.
      □ Meet your team and direct manager.

      WEEK 2-4:
      □ Complete mandatory training modules.
      □ Attend department-specific orientation.
      □ Start initial project assignments.
      □ Schedule a 1-on-1 with your manager.

      IMPORTANT CONTACTS:
      - HR Department: hr@workwise-ai.com
      - IT Support: itsupport@workwise-ai.com
      - Facilities: facilities@workwise-ai.com

      PROBATION:
      - The probation period is 3 months for all new employees.
      - Performance will be reviewed at the end of the probation period.
      - Notice period during probation: 1 month.
      - Notice period after confirmation: 2 months.
    `
  },

  // ==================== COMPANY POLICIES ====================
  {
    id: 'company-001',
    title: 'Work From Home Policy',
    category: 'Company Policies',
    accessLevel: 'all',
    content: `
      Work From Home (WFH) Policy - WorkWise AI

      1. ELIGIBILITY:
         - All employees who have completed their probation period.
         - Subject to role requirements and manager approval.

      2. GUIDELINES:
         - Maximum 2 WFH days per week.
         - WFH requests should be submitted 1 day in advance.
         - Employees must be reachable during core hours (10 AM - 4 PM).
         - A stable internet connection is mandatory.
         - Video must be turned on during meetings.

      3. EQUIPMENT:
         - Employees are responsible for their home office setup.
         - One-time WFH setup allowance of $500 is provided.
         - Company laptop must be used for all official work.

      4. REPORTING:
         - Clock in/out through the WorkWise AI system even on WFH days.
         - Daily status updates to be shared with the manager.
    `
  },
  {
    id: 'company-002',
    title: 'Data Privacy & Confidentiality',
    category: 'Company Policies',
    accessLevel: 'all',
    content: `
      Data Privacy & Confidentiality Policy - WorkWise AI

      1. CONFIDENTIAL INFORMATION:
         - All company data, client information, and trade secrets are confidential.
         - Employees must sign a Non-Disclosure Agreement (NDA) upon joining.
         - Sharing confidential information with unauthorized parties is grounds for termination.

      2. DATA HANDLING:
         - Personal data must be handled in compliance with applicable data protection laws.
         - Employee data is accessible only to authorized HR and management personnel.
         - Client data must not be stored on personal devices.

      3. SECURITY:
         - Use strong passwords and change them every 90 days.
         - Enable two-factor authentication on all company accounts.
         - Report any suspected data breach immediately to IT Security.
         - Lock your workstation when leaving your desk.

      4. ACCEPTABLE USE:
         - Company devices and networks are for official use only.
         - Personal use of company resources should be minimal and reasonable.
         - Downloading unauthorized software is prohibited.
    `
  },
  {
    id: 'company-003',
    title: 'Grievance Redressal Policy',
    category: 'Company Policies',
    accessLevel: 'all',
    content: `
      Grievance Redressal Policy - WorkWise AI

      WorkWise AI is committed to providing a fair grievance redressal mechanism.

      PROCESS:
      1. Level 1 - Direct Manager: Raise the concern with your direct manager first.
      2. Level 2 - HR Department: If unresolved, escalate to HR within 5 working days.
      3. Level 3 - Grievance Committee: For serious matters, a committee of senior management will review.

      TIMELINE:
      - Level 1 resolution: 3 working days.
      - Level 2 resolution: 7 working days.
      - Level 3 resolution: 15 working days.

      CONFIDENTIALITY:
      - All grievances are treated confidentially.
      - No retaliation will be tolerated against employees filing grievances.

      CONTACT:
      - HR Email: hr@workwise-ai.com
      - Anonymous Hotline: Available through WorkWise AI system.
    `
  },

  // ==================== ADMIN-ONLY DOCUMENTS ====================
  {
    id: 'admin-001',
    title: 'Employee Termination Procedures',
    category: 'Internal SOPs',
    accessLevel: 'admin',
    content: `
      Employee Termination Procedures - ADMIN ONLY

      1. VOLUNTARY RESIGNATION:
         - Employee submits written resignation.
         - Notice period: 2 months (1 month during probation).
         - Exit interview conducted by HR.
         - Full & final settlement within 45 days of last working day.

      2. INVOLUNTARY TERMINATION:
         - Requires documentation of performance issues or policy violations.
         - Progressive discipline: Verbal warning → Written warning → PIP → Termination.
         - Legal review required before processing termination.

      3. IMMEDIATE TERMINATION:
         - Applicable for gross misconduct, fraud, or criminal activity.
         - HR and legal must be consulted before proceeding.

      4. EXIT CHECKLIST:
         - Revoke system access and credentials.
         - Collect company assets (laptop, ID card, etc.).
         - Process final salary and pending reimbursements.
         - Issue experience/relieving letter.
    `
  },
  {
    id: 'admin-002',
    title: 'Salary Revision Guidelines',
    category: 'Internal SOPs',
    accessLevel: 'admin',
    content: `
      Salary Revision Guidelines - ADMIN ONLY

      1. ANNUAL INCREMENTS:
         - Standard increment: 8-12% of current CTC.
         - High performers (Rating 4+): 15-20% increment.
         - Outstanding performers (Rating 5): 20-30% increment + potential promotion.

      2. MARKET CORRECTION:
         - Conducted annually based on industry benchmarks.
         - HR to maintain salary bands for each role and level.

      3. APPROVAL PROCESS:
         - Manager recommendation → HR review → Finance approval → CEO sign-off.
         - All increments must be within the approved budget.

      4. SPECIAL INCREMENTS:
         - Off-cycle increments require VP-level approval.
         - Retention offers must be documented and approved by HR head.
    `
  },
  {
    id: 'admin-003',
    title: 'Recruitment Process SOP',
    category: 'Internal SOPs',
    accessLevel: 'admin',
    content: `
      Recruitment Process SOP - ADMIN ONLY

      1. REQUISITION:
         - Hiring manager raises a job requisition with role description.
         - HR and Finance approve based on headcount budget.

      2. SOURCING:
         - Job posted on company website, LinkedIn, and job portals.
         - Employee referral bonus: $1,000 for successful referrals.

      3. SCREENING:
         - Resume screening by HR (2 business days).
         - Technical assessment or test (role-specific).
         - First round interview: Technical/Functional.
         - Second round: HR interview.
         - Final round: Hiring Manager/VP approval.

      4. OFFER:
         - Offer letter generated within 2 business days of selection.
         - Background verification initiated post-acceptance.
         - Pre-joining documentation collected.

      5. ONBOARDING:
         - IT setup arranged 2 days before joining.
         - Welcome kit prepared by HR.
         - Buddy assigned for first month.
    `
  },

  // ==================== TECHNICAL DOCUMENTATION ====================
  {
    id: 'tech-001',
    title: 'WorkWise AI System User Guide',
    category: 'Technical Documentation',
    accessLevel: 'all',
    content: `
      WorkWise AI System User Guide

      GETTING STARTED:
      1. Log in to WorkWise AI using your registered email and password.
      2. Default password for new accounts: Your employee ID + @WorkWise
      3. You must change your password on first login.

      FEATURES FOR EMPLOYEES:
      - Dashboard: View your summary, pending leaves, and announcements.
      - My Attendance: Clock in/out and view your attendance history.
      - My Leaves: Apply for leave, check leave balance, and track status.
      - My Payroll: View monthly salary slips and download PDF payslips.
      - Announcements: Read company-wide announcements.
      - AI Assistant: Ask questions about company policies, leaves, and more.

      FEATURES FOR ADMIN:
      - All employee features plus:
      - Employees: Add, edit, and manage all employees.
      - Departments: Create and manage departments, view department employees.
      - Leave Management: Approve or reject employee leave requests.
      - Payroll: Generate monthly payroll for employees.
      - Attendance Management: View and manage all employee attendance records.

      TROUBLESHOOTING:
      - If you cannot log in, contact IT Support.
      - If the page is not loading, clear your browser cache and refresh.
      - For any system issues, raise a ticket at itsupport@workwise-ai.com.
    `
  }
];

export default knowledgeBase;
