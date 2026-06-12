PETCARE SUITE

09_BACKEND_IMPLEMENTATION_SPEC.md

Version 3.0

Single Source of Truth (SSOT)

Backend Architecture & Implementation Specification


---

1. OBJECTIVE

Dokumen ini menjadi blueprint resmi seluruh backend PetCare Suite.

Mencakup:

Database Architecture
Supabase Implementation
Storage Architecture
Edge Functions
Triggers
Notification Engine
Queue Engine
Invoice Engine
Automation Engine
Background Jobs
Audit Logging
Monitoring
Production Readiness

Semua implementasi backend wajib mengikuti dokumen ini.


---

2. BACKEND STACK

Database:
  PostgreSQL 17 (Supabase)

Authentication:
  Supabase Auth

Storage:
  Supabase Storage

Realtime:
  Supabase Realtime

Functions:
  Supabase Edge Functions (Deno)

PDF:
  PDFKit

Notification:
  WhatsApp
  SMTP Email

Queue:
  PostgreSQL Atomic Function

Scheduler:
  Supabase Cron

Deployment:
  Supabase Cloud


---

3. BACKEND ARCHITECTURE

Frontend

     │

     ▼

Supabase API

     │

 ┌─────────────┐
 │ PostgreSQL  │
 └─────────────┘

     │

 ┌─────────────┐
 │ Edge Funcs  │
 └─────────────┘

     │

 ┌─────────────┐
 │ WhatsApp    │
 ├─────────────┤
 │ SMTP Email  │
 ├─────────────┤
 │ PDF Engine  │
 └─────────────┘


---

4. DATABASE DESIGN PRINCIPLES

Semua tabel wajib:

id uuid primary key

created_at timestamptz

updated_at timestamptz


---

Semua FK wajib:

ON DELETE explicit

Tidak boleh implicit.


---

Contoh:

customer_id uuid
references customers(id)
on delete cascade


---

5. UUID STANDARD

Gunakan:

gen_random_uuid()


---

Tidak boleh:

uuid_generate_v4()


---

6. TIMESTAMP STANDARD

Gunakan:

timestamptz

untuk seluruh datetime.


---

Tidak boleh:

timestamp


---

7. CREATED / UPDATED TRIGGER

Semua tabel memiliki:

created_at

updated_at


---

Trigger global:

set_updated_at()


---

Contoh:

new.updated_at = now();


---

8. AUDIT LOGGING

Semua perubahan penting dicatat.


---

Trigger:

audit_trigger()


---

Event:

INSERT
UPDATE
DELETE


---

Dicatat ke:

audit_logs


---

Data:

user_id

table_name

record_id

old_value

new_value

ip_address

created_at


---

9. SOFT DELETE STRATEGY

Digunakan untuk:

Customers
Pets
Products
Inventory
Profiles


---

Tambahkan:

deleted_at timestamptz


---

Filter global:

deleted_at is null


---

10. STORAGE ARCHITECTURE

Bucket wajib:

avatars

pets

medical

vaccination

grooming

articles

documents

portal


---

11. STORAGE POLICY

Owner:

Full Access


---

Staff:

Upload + Read


---

Doctor:

Medical Only


---

Customer:

Own Files Only


---

12. FILE SIZE LIMITS

Avatar

5 MB


---

Pet Photo

10 MB


---

Medical Attachment

25 MB


---

PDF

15 MB


---

13. ALLOWED FILE TYPES

Images

jpg
jpeg
png
webp


---

Documents

pdf


---

Reject lainnya.


---

14. EDGE FUNCTION LIST

Wajib ada:

send-whatsapp

send-email

generate-pdf

generate-queue

retry-notification

broadcast-message

invoice-generator

vaccination-reminder

expiry-alert

daily-report


---

15. EDGE FUNCTION STANDARD

Semua function wajib:

POST only
JWT Validation
Error Handling
Audit Log


---

16. RESPONSE STANDARD

Semua response:

{
  "success": true,
  "message": "",
  "data": {}
}


---

Error:

{
  "success": false,
  "message": "",
  "error": {}
}


---

17. JWT VALIDATION

WAJIB.


---

Flow:

Authorization Header

↓

Supabase JWT Verify

↓

Execute


---

Jika gagal:

401 Unauthorized


---

18. SEND WHATSAPP FUNCTION

Nama:

send-whatsapp


---

Payload:

{
  "to": "",
  "message": "",
  "userId": ""
}


---

Flow:

Verify JWT

↓

Load Settings

↓

Send WA

↓

Save Log

↓

Return Status


---

19. SEND EMAIL FUNCTION

Payload:

{
  "to": "",
  "subject": "",
  "html": ""
}


---

Flow sama.


---

20. PDF GENERATOR

Support:

Invoice

Receipt

Vaccine Certificate


---

Output:

Supabase Storage URL


---

21. PDF STORAGE PATH

Invoice

documents/invoices


---

Receipt

documents/receipts


---

Certificate

documents/vaccinations


---

22. QUEUE ENGINE

Menggunakan:

generate_queue_number()


---

Atomic.


---

Tidak boleh:

SELECT max(queue)

karena race condition.


---

23. QUEUE FUNCTION

queue_counters

menyimpan:

queue_date

last_number


---

24. INVOICE ENGINE

Invoice Number:

INV-YYYYMMDD-000001


---

Tidak boleh:

Date.now()


---

25. INVOICE SEQUENCE

Gunakan:

invoice_sequence


---

Per hari reset.


---

26. INVOICE AUTOMATION

Appointment selesai:

Generate Invoice


---

Vaccination:

Generate Invoice


---

Grooming:

Generate Invoice


---

Inpatient:

Pending Invoice


---

27. ACCOUNTING AUTOMATION

Invoice Paid

↓

Create Transaction

↓

Revenue Account


---

Refund

↓

Expense Entry


---

28. INVENTORY AUTOMATION

Inbound

↓

Tambah Stock


---

Outbound

↓

Kurangi Stock


---

Adjustment

↓

Recalculate


---

29. INVENTORY TRIGGERS

Trigger:

after_stock_movement()


---

Update:

inventory_items.current_stock


---

Otomatis.


---

30. LOW STOCK ENGINE

Condition:

current_stock <= min_stock


---

Generate Notification.


---

31. EXPIRY ENGINE

Cron harian.


---

Cari:

expiry_date


---

Warning:

90 hari
60 hari
30 hari


---

32. VACCINATION ENGINE

Saat vaksin dibuat:

Create Reminder


---

Auto:

H-30
H-14
H-7
H-1


---

33. REMINDER ENGINE

Scheduler:

pg_cron


---

Jalankan:

Setiap jam


---

34. MEDICATION ENGINE

Cari:

medication_schedules


---

Kirim:

WhatsApp Reminder


---

35. NOTIFICATION ENGINE

Channels:

WhatsApp
Email


---

Future:

Push Notification
SMS


---

36. NOTIFICATION LOGGING

Semua notification:

notifications_log


---

Tidak boleh ada exception.


---

37. RETRY ENGINE

Status:

failed


---

Retry:

3x


---

Interval:

5m
15m
60m


---

38. BROADCAST ENGINE

Segment:

All

Active

VIP

Inactive


---

Batch:

100 recipients

per cycle.


---

39. REPORT ENGINE

Materialized View:

mv_daily_revenue

mv_monthly_revenue

mv_doctor_revenue

mv_inventory_value


---

Refresh:

nightly


---

40. DASHBOARD ENGINE

Dashboard tidak query raw table.


---

Harus menggunakan:

views

materialized views


---

41. REALTIME EVENTS

Aktif untuk:

Appointments

Notifications

Monitoring

Inpatient


---

42. AUDIT EVENTS

Catat:

Login

Logout

Create

Update

Delete

Status Change


---

43. LOGIN AUDIT

Saat login sukses:

audit_logs


---

Action:

login


---

44. SECURITY MODEL

Semua akses:

RLS First


---

Tidak boleh mengandalkan frontend.


---

45. OWNER POLICY

Owner:

Full Access


---

Seluruh tabel.


---

46. CUSTOMER POLICY

Customer hanya:

Own Data


---

Melalui:

profile_id

atau

customer_id


---

47. SERVICE ROLE USAGE

Hanya:

Edge Functions


---

Tidak boleh frontend.


---

48. DATABASE FUNCTIONS

Wajib tersedia:

generate_queue_number

generate_invoice_number

create_vaccine_reminders

create_audit_log

refresh_reports


---

49. CRON JOBS

Daily:

Vaccination Reminder

Expiry Alert

Refresh Reports

Cleanup Temp Files


---

Hourly:

Notification Queue

Medication Reminder


---

50. OBSERVABILITY

Log:

Edge Function Errors

Notification Errors

Storage Errors

Database Errors


---

Retention:

90 Days


---

51. HEALTH CHECK

Function:

health-check


---

Check:

Database

Storage

Email

WhatsApp


---

52. BACKUP STRATEGY

Database:

Daily Backup


---

Retention:

30 Days


---

53. DISASTER RECOVERY

Target:

RPO < 24h

RTO < 4h


---

54. PERFORMANCE TARGET

API Response:

< 500ms


---

Dashboard:

< 2s


---

Search:

< 1s


---

55. SCALABILITY TARGET

Per Clinic:

50 Users

100.000 Customers

200.000 Pets

1.000.000 Medical Records


---

Tanpa redesign database.


---

56. MULTI-TENANT READINESS

Walaupun versi awal single clinic.

Semua tabel WAJIB menyiapkan:

clinic_id uuid

untuk versi SaaS masa depan.


---

Status:

Dormant
Not Used Yet

tetapi sudah ada di schema.


---

57. BACKEND TEST COVERAGE

Target:

80%


---

Critical:

Queue Engine

Invoice Engine

Inventory Engine

Notification Engine


---

Target:

95%


---

58. PRODUCTION CHECKLIST

Wajib PASS:

RLS aktif seluruh tabel

Storage policy aktif

Audit log aktif

JWT validation aktif

Queue atomic aktif

Invoice sequence aktif

Notification retry aktif

Backup aktif

Cron aktif

Materialized view aktif

Health check aktif

Error monitoring aktif



---

59. ESTIMASI BACKEND LOC

Module	LOC

Migrations	12.000
RLS	5.000
Triggers	3.000
Database Functions	4.000
Edge Functions	8.000
Notification Engine	4.000
Report Engine	2.000
Testing	8.000



---

Total Backend

±45.000 – 60.000 LOC


---

60. BACKEND ACCEPTANCE CRITERIA

Backend dianggap selesai jika:

Semua migration berhasil

Semua trigger berjalan

Semua RLS aman

Semua edge function berjalan

Semua PDF berjalan

Semua invoice berjalan

Semua notification berjalan

Semua report berjalan

Semua cron berjalan

Semua test PASS

Production deployment PASS



---

END OF 

