PETCARE SUITE

FRONTEND ARCHITECTURE SPECIFICATION

Version 3.0

Single Source of Truth (SSOT)


---

1. FRONTEND OVERVIEW

Frontend merupakan satu-satunya client application untuk:

Owner

Doctor

Staff

Customer Portal

Public Website


Platform:

React 18
TypeScript 5
Vite 5

Tidak diperbolehkan mengganti stack tanpa revisi spesifikasi.


---

2. TECHNOLOGY STACK

Core

{
  "react": "^18",
  "typescript": "^5",
  "vite": "^5"
}


---

UI

{
  "tailwindcss": "^3",
  "shadcn/ui": "latest",
  "@radix-ui/react-*": "latest"
}


---

State

{
  "@tanstack/react-query": "^5",
  "zustand": "^4"
}


---

Routing

{
  "react-router-dom": "^6"
}


---

Forms

{
  "react-hook-form": "^7"
}


---

Charts

{
  "recharts": "^3"
}


---

Icons

{
  "lucide-react": "latest"
}


---

Backend SDK

{
  "@supabase/supabase-js": "^2"
}


---

3. PROJECT STRUCTURE

Root Structure

src/
├── app/
├── router/
├── pages/
├── features/
├── components/
├── hooks/
├── stores/
├── lib/
├── types/
├── styles/
├── assets/
└── main.tsx


---

4. FEATURE-BASED ARCHITECTURE

Seluruh domain wajib berada dalam:

src/features


---

Feature Structure Standard

features/
└── appointments/
    ├── pages/
    ├── components/
    ├── appointments.service.ts
    ├── appointments.hooks.ts
    ├── appointments.types.ts
    ├── appointments.schema.ts
    ├── index.ts
    └── __tests__/


---

Forbidden

Dilarang membuat:

services/
queries/
repositories/

global folder.

Semua harus berada dalam feature masing-masing.


---

5. APPLICATION LAYERS

Setiap module wajib mengikuti:

UI
 ↓
Hooks
 ↓
Services
 ↓
Supabase


---

UI Layer

Hanya:

Rendering
Forms
Dialogs
Tables

Tidak boleh query database langsung.


---

Hook Layer

Menggunakan:

TanStack Query

Untuk:

Fetching
Mutation
Caching
Invalidation


---

Service Layer

Berisi:

Supabase Query
Business Logic
Transform Data


---

6. ROUTING ARCHITECTURE

Public Routes

/
 /services
 /articles
 /articles/:slug
 /contact
 /login
 /forgot-password
 /reset-password


---

Internal Routes

/dashboard

/staff/*
/doctor/*
/profile


---

Portal Routes

/portal
/portal/pets
/portal/appointments
/portal/invoices
/portal/profile


---

7. ROUTE GUARDS

AuthGuard

Memastikan:

User Login
User Active
Session Valid


---

RoleGuard

Memastikan:

Allowed Roles


---

ModuleGuard

Memastikan:

Module Enabled


---

8. ROUTE CONFIG STANDARD

Semua route harus menggunakan:

RouteConfig

Contoh:

{
 path: "/staff/customers",
 component: CustomersPage,
 roles: ["owner","staff"],
 module: "clinic"
}


---

9. LAYOUT ARCHITECTURE

PublicLayout

Digunakan:

Website
Blog
Landing Page


---

AppShell

Digunakan:

Owner
Doctor
Staff

Komponen:

Sidebar
Topbar
Content


---

PortalLayout

Digunakan:

Customer Portal


---

10. PAGE STANDARDS

Semua halaman wajib:

<PageHeader />
<Content />


---

Contoh:

<PageHeader
 title="Customers"
 description="Manage customers"
/>


---

11. GLOBAL COMPONENTS

Lokasi:

components/common


---

PageHeader

Digunakan seluruh halaman.


---

DataTable

Digunakan seluruh tabel.

Fitur wajib:

Sorting
Pagination
Search
Empty State


---

PageSkeleton

Digunakan seluruh loading state.

Spinner tidak diperbolehkan sebagai loading utama.


---

ErrorBoundary

Wajib membungkus seluruh page.


---

FileUpload

Standar upload file.


---

12. SHADCN RULES

Semua UI menggunakan:

shadcn/ui

Prioritas:

Button
Dialog
Drawer
Sheet
Dropdown
Table
Card
Form
Tabs


---

Tidak diperbolehkan:

Material UI
Ant Design
Bootstrap


---

13. FORM STANDARDS

Semua form menggunakan:

React Hook Form


---

Validasi:

Real Time


---

Error harus muncul:

Per Field


---

14. STATE MANAGEMENT


---

Zustand

Digunakan hanya untuk:

Auth
UI
Module
Cart


---

Tidak digunakan untuk:

Appointments
Customers
Pets
Medical Records

karena harus menggunakan Query.


---

15. AUTH STORE

user
role
session
isInitializing

Actions:

setUser()
setSession()
clearAuth()


---

16. MODULE STORE

modules
loading
error

Action:

fetchModuleStatus()


---

17. UI STORE

theme
sidebarCollapsed


---

18. CART STORE

Digunakan POS.

State:

cart
customer
paymentData

Actions:

addItem()
removeItem()
updateQuantity()
clearCart()
computeTotals()


---

19. TANSTACK QUERY STANDARD

Query Key

Format wajib:

["appointments", params]


---

Contoh:

["customers"]
["pets", customerId]
["invoice", invoiceId]


---

20. QUERY RULES

Seluruh fetch data:

useQuery()


---

Seluruh mutasi:

useMutation()


---

Tidak diperbolehkan:

useEffect(async ()=>{})

untuk fetch data.


---

21. SERVICE STANDARD

Contoh:

customers.service.ts

Berisi:

getCustomers()
createCustomer()
updateCustomer()
deleteCustomer()


---

Tidak boleh:

toast()
dialog()
navigate()

di service.


---

22. HOOK STANDARD

Contoh:

customers.hooks.ts

Berisi:

useCustomers()
useCreateCustomer()
useUpdateCustomer()


---

23. TYPESCRIPT RULES

Strict Mode

Wajib:

{
 "strict": true
}


---

Forbidden

any

Tidak diperbolehkan.


---

Gunakan:

unknown

atau type eksplisit.


---

24. COMPONENT RULES

Naming

PascalCase

Contoh:

CustomerCard
AppointmentDialog
InvoiceTable


---

25. FILE NAMING

kebab-case

Contoh:

customer-card.tsx
appointment-dialog.tsx


---

26. ERROR HANDLING

Seluruh error Supabase harus melalui:

handleSupabaseError()


---

Tidak boleh:

console.error(error)

sebagai final handling.


---

27. TOAST STANDARD

Create:

Success Toast

Update:

Success Toast

Delete:

Success Toast

Error:

Error Toast


---

28. LOADING STANDARD

Gunakan:

<PageSkeleton />


---

Jangan gunakan:

Loading...


---

29. EMPTY STATE STANDARD

Semua list page wajib memiliki:

Icon
Title
Description
Action Button


---

30. ACCESSIBILITY

Wajib:

Keyboard Navigation
ARIA Labels
Focus Management
Dialog Accessibility


---

31. RESPONSIVE BREAKPOINTS

sm
md
lg
xl
2xl

Tailwind default.


---

32. PERFORMANCE RULES

Semua halaman:

React.lazy()
Suspense


---

Semua route:

Code Split


---

33. DOCUMENT TITLE

Semua halaman wajib:

useDocumentTitle()

Contoh:

useDocumentTitle("Customers")


---

34. DARK MODE

Mode:

Light
Dark


---

Disimpan dalam:

ui.store


---

35. FRONTEND ACCEPTANCE CRITERIA

Frontend dianggap selesai jika:

✓ Semua route berjalan
✓ Semua guard berjalan
✓ Semua module guard berjalan
✓ Semua role berjalan
✓ Semua loading menggunakan skeleton
✓ Semua error menggunakan toast
✓ Semua forms menggunakan RHF
✓ Semua fetch menggunakan Query
✓ Semua state sesuai standar
✓ Semua halaman responsive
✓ Dark Mode berjalan
✓ Accessibility minimum terpenuhi


---

END OF DOCUMENT — 
