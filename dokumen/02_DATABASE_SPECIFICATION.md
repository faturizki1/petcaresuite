PETCARE SUITE

DATABASE SPECIFICATION

Version 3.0

Single Source of Truth (SSOT)

---

1. DATABASE OVERVIEW

Database Engine

PostgreSQL 17 (Supabase Managed)

Naming Convention

Tables

snake_case
plural

Contoh:

customers
medical_records
inventory_items

Columns

snake_case

Contoh:

full_name
created_at
appointment_date

Primary Keys

Semua tabel menggunakan:

uuid

Format:

id uuid primary key

---

2. REQUIRED EXTENSIONS

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

---

3. ENUM DEFINITIONS

User Role

create type user_role_enum as enum (
  'owner',
  'doctor',
  'staff',
  'customer'
);

---

Module Key

create type module_key_enum as enum (
  'clinic',
  'monitoring',
  'inpatient',
  'grooming',
  'petshop',
  'inventory',
  'accounting',
  'website'
);

---

Appointment Status

create type appointment_status_enum as enum (
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no-show'
);

---

Customer Status

create type customer_status_enum as enum (
  'active',
  'inactive',
  'vip',
  'blacklisted'
);

---

Cage Status

create type cage_status_enum as enum (
  'available',
  'occupied',
  'cleaning',
  'maintenance'
);

---

Payment Method

create type payment_method_enum as enum (
  'cash',
  'card',
  'bank-transfer',
  'e-wallet'
);

---

Invoice Status

create type invoice_status_enum as enum (
  'draft',
  'pending',
  'paid',
  'cancelled',
  'refunded'
);

---

Transaction Type

create type transaction_type_enum as enum (
  'debit',
  'credit'
);

---

Account Type

create type account_type_enum as enum (
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense'
);

---

Notification Provider

create type notification_provider_enum as enum (
  'whatsapp',
  'email',
  'sms'
);

---

Stock Movement Type

create type stock_movement_type_enum as enum (
  'inbound',
  'outbound',
  'adjustment'
);

---

Medical Record Type

create type medical_record_type_enum as enum (
  'consultation',
  'follow-up',
  'emergency',
  'surgery'
);

---

4. GLOBAL TABLE STANDARDS

Semua tabel wajib memiliki:

created_at timestamptz not null default now()
updated_at timestamptz not null default now()

Kecuali:

audit_logs
notifications_log
transactions

yang menggunakan timestamp historis.

---

5. COMMON FUNCTIONS

Updated At Trigger

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

Semua tabel mutable wajib menggunakan trigger ini.

---

6. SYSTEM TABLES

profiles

Tujuan:

Menyimpan informasi user aplikasi.

id uuid primary key
references auth.users(id)
on delete cascade

full_name text not null

email text unique not null

whatsapp text

avatar_url text

role user_role_enum not null

is_active boolean not null default true

created_at timestamptz default now()

updated_at timestamptz default now()

---

settings

id uuid primary key default gen_random_uuid()

key text unique not null

value jsonb not null default '{}'

updated_by uuid
references profiles(id)

updated_at timestamptz default now()

---

modules

id uuid primary key default gen_random_uuid()

key module_key_enum unique not null

is_enabled boolean not null default true

updated_at timestamptz default now()

---

7. AUDIT SYSTEM

audit_logs

Audit wajib immutable.

Tidak boleh diupdate.

id uuid primary key default gen_random_uuid()

user_id uuid
references profiles(id)

action text not null

table_name text not null

record_id uuid

old_value jsonb

new_value jsonb

ip_address inet

created_at timestamptz default now()

---

8. SEQUENCE SYSTEM

Invoice Sequence

Wajib menggunakan sequence database.

create sequence invoice_number_seq;

---

Generate Invoice Number

Format:

INV-20260613-000001

Function:

generate_invoice_number()

Output wajib unik.

Tidak boleh menggunakan:

now()
random()
timestamp

sebagai generator utama.

---

9. STORAGE ARCHITECTURE

Storage Buckets

avatars

public

Menyimpan avatar user.

---

pets

private

Foto hewan.

---

medical-records

private

Lampiran medis.

---

vaccinations

private

Sertifikat vaksin.

---

grooming

private

Before-after grooming.

---

monitoring

private

Owner uploads.

---

website

public

Artikel dan media website.

---

10. STORAGE RULES

Customer hanya dapat membaca file miliknya sendiri.

Doctor dan Owner dapat membaca seluruh file medis.

Staff hanya dapat membaca file operasional.

Tidak ada bucket yang boleh memiliki policy:

true

untuk authenticated.

---

11. SOFT DELETE STRATEGY

Tabel berikut wajib soft delete:

customers
pets
products
inventory_items
services
vaccines

Kolom:

deleted_at timestamptz

deleted_by uuid
references profiles(id)

Data tidak pernah dihapus permanen dari UI.

---

12. CUSTOMER DOMAIN

customers

Entity pemilik hewan.

id uuid primary key

profile_id uuid
references profiles(id)

full_name text not null

whatsapp text

email text

address text

notes text

status customer_status_enum default 'active'

loyalty_points bigint default 0

membership_tier text

registration_date date default current_date

created_by uuid
references profiles(id)

created_at timestamptz

updated_at timestamptz

deleted_at timestamptz

---

13. PET DOMAIN

species

id uuid primary key

name text unique not null

created_at timestamptz

---

breeds

id uuid primary key

species_id uuid not null
references species(id)

name text not null

created_at timestamptz

Constraint:

unique(species_id,name)

---

pets

id uuid primary key

customer_id uuid not null
references customers(id)

name text not null

photo_url text

species_id uuid not null
references species(id)

breed_id uuid
references breeds(id)

gender text not null

birth_date date

weight numeric(8,2)

color text

is_sterilized boolean default false

microchip_number text

qr_code text unique

is_active boolean default true

created_at timestamptz

updated_at timestamptz

deleted_at timestamptz

---

14. LOYALTY RULES (FINAL)

Perbaikan dari versi sebelumnya.

Earn

Rp 10.000 = 1 poin

Formula:

earned_points =
floor(total_paid / 10000)

---

Redeem

1 poin = Rp 100

Formula:

discount =
points * 100

---

Example

Transaksi:

Rp 500.000

Poin:

50 poin

Nilai tukar:

Rp 5.000

Masuk akal secara bisnis.

---

15. DATABASE DESIGN RULES

Dilarang:

NOT NULL
+
ON DELETE SET NULL

Contoh salah:

doctor_id uuid not null
references doctors(id)
on delete set null

Contoh benar:

doctor_id uuid
references doctors(id)
on delete set null

Aturan ini wajib dipatuhi pada seluruh schema.

---

16. RLS PRINCIPLES

Semua tabel wajib:

alter table xxx enable row level security;

Tidak ada tabel operasional yang boleh tanpa RLS.

---

17. ROLE DETECTION STANDARD

Dilarang menggunakan:

auth.role()

Wajib menggunakan:

exists (
 select 1
 from profiles p
 where p.id = auth.uid()
 and p.role = 'owner'
)

Sebagai standar seluruh policy.

---

END OF DOCUMENT
