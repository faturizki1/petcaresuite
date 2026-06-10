
**INSTRUKSI 1 of 6 — Project Setup & Architecture**

```
You are building PetCare Suite from scratch — a fullstack veterinary clinic and petshop management system. This is instruction 1 of 6. Complete every implementation fully. Do not scaffold, do not leave TODOs, do not stop at foundation. Every file you create must be production-ready.

HARD RULES (enforce throughout all 6 instructions):
- No emoji anywhere in code, comments, or UI text. Use lucide-react icons for all UI iconography.
- No incomplete implementations. If a function exists, it must be fully implemented.
- No placeholder comments like "// implement later" or "// TODO".
- Clean, consistent codebase. Every file has a single clear responsibility.
- All code in English: variables, functions, comments, commit messages.
- Unit tests are required for every module. Tests must be systematic, readable, and grouped by feature.
- Folder structure must be strict and never mixed. No logic in UI components, no UI in hooks.

TECH STACK:
- Frontend: React 18 + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS
- State: TanStack Query v5 + Zustand
- Backend: Supabase (Auth + PostgreSQL + Storage + Realtime + Edge Functions)
- Testing: Vitest + React Testing Library
- Deployment: Vercel (frontend) + Supabase Cloud

FOLDER STRUCTURE to create:
src/
  assets/
  components/
    ui/           # shadcn/ui base components only
    common/       # shared app components (PageHeader, DataTable, ConfirmDialog, etc)
    layout/       # Sidebar, Navbar, AppShell
  features/
    auth/
    customers/
    pets/
    appointments/
    medical-records/
    vaccinations/
    monitoring/
    inpatient/
    grooming/
    petshop/
    inventory/
    pos/
    accounting/
    notifications/
    reports/
    settings/
    website/
  hooks/          # global reusable hooks
  lib/            # supabase client, utils, constants
  stores/         # zustand stores
  types/          # global TypeScript types
  test/           # test utilities and setup

TASKS FOR THIS INSTRUCTION:

1. Initialize Vite + React + TypeScript project with strict tsconfig.
2. Install and configure: tailwindcss, shadcn/ui, @tanstack/react-query, zustand, @supabase/supabase-js, react-router-dom v6, lucide-react, vitest, @testing-library/react, @testing-library/user-event.
3. Create the complete folder structure above with index.ts barrel exports in each folder.
4. Create src/lib/supabase.ts — Supabase client initialized from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.
5. Create src/lib/constants.ts — app name, version, pagination defaults, all magic numbers.
6. Create src/lib/utils.ts — cn() helper, formatCurrency (IDR), formatDate, formatPhone, truncate, generateQRData.
7. Create src/types/index.ts — export all global types: UserRole, ModuleKey, AppointmentStatus, CustomerStatus, CageStatus, PaymentMethod, StockMovementType, NotificationProvider.
8. Create src/stores/auth.store.ts — Zustand store for current user, role, session. Actions: setUser, setSession, clearAuth.
9. Create src/stores/ui.store.ts — Zustand store for sidebar collapsed state, active theme, command palette open state.
10. Create src/stores/module.store.ts — Zustand store for enabled/disabled module status. Fetched from Supabase settings table.
11. Create vite.config.ts with path aliases (@/ maps to src/), vitest config embedded.
12. Create src/test/setup.ts — vitest global setup, mock Supabase client.
13. Create src/test/utils.tsx — custom render wrapper with QueryClient provider and Router.
14. Write unit tests in src/lib/utils.test.ts covering all utility functions with edge cases.
15. Create .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
16. Create README.md with setup instructions: clone, copy .env, npm install, npm run dev, npm run test.

Do not proceed to routing or UI until all above are complete and tests pass.
```

---

**INSTRUKSI 2 of 6 — Database Schema & Supabase Setup**

```
This is instruction 2 of 6 for PetCare Suite. Complete every SQL migration fully. No partial tables. Every table must have RLS enabled with policies for all four roles: owner, doctor, staff, customer.

ROLES REFERENCE:
- owner: full access to everything
- doctor: full access to all medical data
- staff: operational access (customers, pets, appointments, pos, inventory, grooming, inpatient)
- customer: read-only access to their own data only

TASKS FOR THIS INSTRUCTION:

1. Create supabase/migrations/ folder.

2. Create migration 001_core.sql:
   - profiles (id uuid references auth.users, full_name, email, whatsapp, role user_role_enum, is_active, avatar_url, created_at, updated_at)
   - settings (id, key varchar unique, value jsonb, updated_at, updated_by)
   - modules (id, key module_key_enum unique, is_enabled, updated_at)
   - audit_logs (id, user_id, action, table_name, record_id, old_value jsonb, new_value jsonb, ip_address, created_at)
   - notifications_log (id, user_id, channel, recipient, template_key, payload jsonb, status, error_message, sent_at)

3. Create migration 002_customers.sql:
   - customers (id, profile_id uuid references profiles nullable, full_name, whatsapp, email, address, notes, status customer_status_enum, loyalty_points int default 0, membership_tier, registration_date, created_by, created_at, updated_at)

4. Create migration 003_pets.sql:
   - species (id, name, created_at)
   - breeds (id, species_id, name, created_at)
   - pets (id, customer_id, name, photo_url, species_id, breed_id, gender, birth_date, weight decimal, color, is_sterilized, microchip_number, qr_code, is_active, created_at, updated_at)

5. Create migration 004_appointments.sql:
   - services (id, name, description, duration_minutes, price, category, is_active, created_at)
   - doctors (id, profile_id references profiles, specialization, bio, photo_url, is_active, created_at)
   - doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, is_available)
   - appointments (id, customer_id, pet_id, doctor_id, service_id, appointment_date, start_time, end_time, status appointment_status_enum, queue_number, notes, created_by, created_at, updated_at)

6. Create migration 005_medical_records.sql:
   - medical_records (id, appointment_id nullable, pet_id, doctor_id, record_type, subjective, objective, assessment, plan, notes, created_at, updated_at)
   - prescriptions (id, medical_record_id, drug_name, dose, duration_days, instruction, created_at)
   - medical_attachments (id, medical_record_id, file_url, file_type, file_name, uploaded_by, created_at)

7. Create migration 006_vaccinations.sql:
   - vaccines (id, name, description, manufacturer, is_active, created_at)
   - vaccination_records (id, pet_id, vaccine_id, doctor_id, vaccinated_at, next_due_date, batch_number, notes, certificate_url, created_at)
   - vaccination_reminders (id, vaccination_record_id, remind_at, channel, status, sent_at)

8. Create migration 007_monitoring.sql:
   - weight_records (id, pet_id, weight decimal, recorded_at, recorded_by, notes)
   - medication_schedules (id, pet_id, medical_record_id nullable, drug_name, dose, frequency, start_date, end_date, instruction, is_active, created_at)
   - medication_logs (id, medication_schedule_id, taken_at, status, notes, logged_by)
   - recovery_notes (id, pet_id, medical_record_id, note, photo_url, recorded_at, recorded_by)
   - owner_uploads (id, pet_id, customer_id, photo_url, note, reviewed_by, reviewed_at, created_at)

9. Create migration 008_inpatient.sql:
   - cages (id, name, cage_type, status cage_status_enum, notes, created_at)
   - inpatient_records (id, pet_id, cage_id, admitting_doctor_id, admit_date, discharge_date, reason, notes, status, created_at, updated_at)
   - daily_observations (id, inpatient_record_id, temperature decimal, appetite, weight decimal, condition, notes, observed_by, observed_at)
   - inpatient_medication_schedules (id, inpatient_record_id, drug_name, dose, schedule_time, given_at, given_by, status)

10. Create migration 009_grooming.sql:
    - grooming_services (id, name, description, price, duration_minutes, is_active, created_at)
    - grooming_records (id, pet_id, service_id, groomer_id nullable, scheduled_at, completed_at, status, notes, photo_before_url, photo_after_url, created_at)

11. Create migration 010_inventory.sql:
    - inventory_categories (id, name, created_at)
    - suppliers (id, name, contact, address, notes, created_at)
    - inventory_items (id, name, category_id, unit, min_stock, current_stock, price_per_unit, is_active, created_at, updated_at)
    - inventory_batches (id, item_id, supplier_id, batch_number, quantity, expiry_date, purchase_price, received_at, created_by)
    - stock_movements (id, item_id, batch_id nullable, movement_type stock_movement_type_enum, quantity, reference_type, reference_id, notes, created_by, created_at)

12. Create migration 011_petshop.sql:
    - product_categories (id, name, slug, created_at)
    - brands (id, name, created_at)
    - products (id, name, slug, description, category_id, brand_id, sku, barcode, base_price, is_active, created_at, updated_at)
    - product_variants (id, product_id, name, size, weight, color, price, stock, created_at)
    - product_images (id, product_id, url, is_primary, sort_order, created_at)

13. Create migration 012_pos.sql:
    - invoices (id, invoice_number varchar unique, customer_id nullable, appointment_id nullable, inpatient_record_id nullable, subtotal, discount_amount, loyalty_points_used, total, payment_method payment_method_enum, payment_method_secondary nullable, paid_amount, change_amount, status invoice_status_enum, notes, created_by, created_at, paid_at)
    - invoice_items (id, invoice_id, item_type varchar, reference_id uuid nullable, name, quantity, unit_price, discount, total, created_at)
    - refunds (id, invoice_id, amount, reason, created_by, created_at)

14. Create migration 013_accounting.sql:
    - accounts (id, name, type account_type_enum, description, is_active, created_at)
    - transactions (id, account_id, invoice_id nullable, type transaction_type_enum, amount, description, reference, transaction_date, created_by, created_at)

15. Create migration 014_website.sql:
    - articles (id, title, slug, content, excerpt, cover_url, author_id, is_published, published_at, created_at, updated_at)
    - testimonials (id, customer_name, content, rating, photo_url, is_active, created_at)
    - website_content (id, section_key varchar unique, content jsonb, updated_at, updated_by)

16. For every table create RLS policies:
    - owners: full access (select, insert, update, delete)
    - doctors: access scoped to medical data tables
    - staff: access scoped to operational tables
    - customers: select only on their own data using auth.uid() = customer profile link

17. Create supabase/seed.sql:
    - Insert default modules (all enabled)
    - Insert default settings (empty whatsapp config, empty smtp config)
    - Insert default service categories
    - Insert default account types for accounting
    - Insert sample species and breeds

18. Create supabase/functions/ folder structure for Edge Functions:
    - send-whatsapp/index.ts — reads settings from DB, sends via Fonnte or Wablas based on provider setting
    - send-email/index.ts — reads SMTP settings from DB, sends via nodemailer
    - generate-queue/index.ts — atomic queue number generation per day
    - generate-pdf/index.ts — receipt and vaccine certificate PDF generation

19. Write unit tests in supabase/functions/send-whatsapp/index.test.ts covering: Fonnte provider, Wablas provider, missing config error, failed send error.

All migrations must be idempotent. Use CREATE TABLE IF NOT EXISTS. All timestamps use timestamptz. All ids use gen_random_uuid() as default.
```

---

**INSTRUKSI 3 of 6 — Auth, Layout & Core UI**

```
This is instruction 3 of 6 for PetCare Suite. Build the complete authentication flow and application shell. Every component must be fully implemented with proper loading states, error handling, and responsive design. No skeleton components left empty.

DESIGN RULES (enforce in every component):
- Use lucide-react for all icons. No emoji.
- shadcn/ui as base component library.
- Tailwind CSS for all styling. No inline styles.
- Dark mode and light mode fully supported via CSS variables.
- All data fetch states handled: loading (skeleton), error (error boundary + retry), empty (illustration + message).
- All destructive actions require ConfirmDialog.
- Toast notifications for all mutations (success and error).
- Fully responsive: desktop sidebar, tablet collapsible sidebar, mobile bottom nav or hamburger.

TASKS FOR THIS INSTRUCTION:

1. Create src/components/layout/AppShell.tsx:
   - Authenticated layout wrapper
   - Sidebar on desktop, collapsible on tablet, drawer on mobile
   - Top navbar with: global search trigger, notification bell with badge, theme switcher, user avatar menu
   - Breadcrumb below navbar
   - Main content area with padding

2. Create src/components/layout/Sidebar.tsx:
   - Navigation grouped by: Main, Clinical, Operations, Finance, System
   - Each nav item: icon (lucide), label, active state
   - Module-aware: hide nav items if module is disabled (read from module.store.ts)
   - Collapse to icon-only mode on desktop
   - Role-aware: hide items the current role cannot access

3. Create src/components/layout/Navbar.tsx:
   - Search button that opens CommandPalette
   - NotificationBell with unread count badge, dropdown showing latest 5 notifications
   - ThemeSwitcher toggle
   - UserMenu: avatar, name, role badge, profile link, logout button

4. Create src/components/common/CommandPalette.tsx:
   - Triggered by Cmd+K / Ctrl+K
   - Search across: pages (navigation), customers, pets
   - Keyboard navigable
   - Uses Supabase full text search for customers and pets

5. Create src/components/common/DataTable.tsx:
   - Generic typed table component
   - Props: columns, data, isLoading, pagination, onPageChange, filters slot, actions slot
   - Skeleton rows during loading
   - Empty state with icon and message when data is empty
   - Row click handler optional

6. Create src/components/common/PageHeader.tsx:
   - Props: title, description, actions (ReactNode slot)
   - Consistent spacing and typography

7. Create src/components/common/ConfirmDialog.tsx:
   - Props: title, description, onConfirm, onCancel, variant (danger/warning)
   - Danger variant shows red confirm button

8. Create src/components/common/EmptyState.tsx:
   - Props: icon (lucide), title, description, action (optional button)

9. Create src/components/common/FileUpload.tsx:
   - Drag and drop + click to upload
   - Preview for images
   - Upload to Supabase Storage
   - Props: bucket, path, accept, maxSize, onUpload

10. Create src/components/common/QRCodeCard.tsx:
    - Displays QR code for a pet
    - Print button
    - Download button

11. Create src/features/auth/ — complete implementation:
    - auth.service.ts: signIn, signOut, resetPassword, updatePassword using Supabase Auth
    - auth.hooks.ts: useAuth, useSignIn, useSignOut, useResetPassword
    - auth.types.ts: SignInForm, ResetPasswordForm
    - pages/LoginPage.tsx: full form with email + password, show/hide password, forgot password link, form validation
    - pages/ForgotPasswordPage.tsx: email form, success state
    - pages/ResetPasswordPage.tsx: new password form with confirmation
    - AuthGuard.tsx: HOC that redirects unauthenticated users to /login
    - RoleGuard.tsx: HOC that shows 403 if role not permitted

12. Create src/router/index.tsx:
    - React Router v6 with createBrowserRouter
    - Lazy load every page with React.lazy and Suspense
    - Auth routes: /login, /forgot-password, /reset-password
    - Owner routes under /dashboard protected by AuthGuard + RoleGuard
    - Doctor routes under /doctor
    - Staff routes under /staff
    - Customer portal under /portal
    - Public website under /
    - Error pages: 403, 404, 500

13. Create src/router/routes.ts:
    - All route path constants as typed string literals
    - No hardcoded strings in components

14. Create error pages:
    - pages/403.tsx: unauthorized, back button
    - pages/404.tsx: not found, home button
    - pages/500.tsx: server error, retry button
    - Each with relevant lucide icon and helpful message

15. Write unit tests:
    - auth.service.test.ts: signIn success, signIn wrong password, signOut, resetPassword
    - AuthGuard.test.tsx: redirects unauthenticated, renders children when authenticated
    - RoleGuard.test.tsx: renders for permitted role, shows 403 for wrong role
    - CommandPalette.test.tsx: opens on Cmd+K, navigates with keyboard, closes on Escape
    - DataTable.test.tsx: renders rows, shows skeleton on loading, shows empty state

Do not skip any task. All components must compile without TypeScript errors.
```

---

**INSTRUKSI 4 of 6 — Clinical Modules**

```
This is instruction 4 of 6 for PetCare Suite. Build all clinical modules completely: Customers, Pets, Appointments, Medical Records, Vaccinations, and Monitoring. Every page must be fully functional — forms, lists, detail views, and all sub-features.

HARD RULES:
- Every list page has: search, filter, pagination, loading skeleton, empty state.
- Every form has: full validation, error messages per field, loading state on submit, success toast, error toast.
- Every detail page has: tabbed layout, breadcrumb, edit button, relevant action buttons.
- No lucide icon omitted — every UI action must have an icon.
- No emoji anywhere.

TASKS FOR THIS INSTRUCTION:

1. CUSTOMER MODULE — src/features/customers/
   - customers.types.ts: Customer, CustomerStatus, CustomerFormData, LoyaltyTransaction
   - customers.service.ts: getCustomers (paginated + search + filter by status), getCustomerById, createCustomer, updateCustomer, updateCustomerStatus, getCustomerPets, getCustomerInvoices, getCustomerActivityLog, adjustLoyaltyPoints
   - customers.hooks.ts: useCustomers, useCustomer, useCreateCustomer, useUpdateCustomer, useUpdateCustomerStatus
   - pages/CustomersPage.tsx: table with columns (name, whatsapp, email, status badge, loyalty points, registered date), search bar, status filter, create button
   - pages/CreateCustomerPage.tsx: full form
   - pages/CustomerDetailPage.tsx: tabs — Overview (profile card + stats), Pets (list with add button), Medical History (timeline), Invoices (table), Activity (log)
   - pages/EditCustomerPage.tsx: pre-filled form
   - components/CustomerStatusBadge.tsx
   - components/LoyaltyPointsCard.tsx

2. PET MODULE — src/features/pets/
   - pets.types.ts: Pet, PetFormData, WeightRecord
   - pets.service.ts: getPets, getPetById, createPet, updatePet, generateQRCode, getPetTimeline
   - pets.hooks.ts: useGetPets, usePet, useCreatePet, useUpdatePet
   - pages/PetsPage.tsx: grid/table toggle view, search, filter by species, photo thumbnail
   - pages/CreatePetPage.tsx: full form with photo upload, species/breed cascading select
   - pages/PetProfilePage.tsx: tabs — Overview (profile + QR card), Medical Records, Vaccinations, Monitoring, Inpatient, Grooming, Timeline, Documents
   - pages/EditPetPage.tsx
   - components/PetCard.tsx: photo, name, species, breed, age, status
   - components/PetQRCard.tsx: QR code with print/download

3. APPOINTMENT MODULE — src/features/appointments/
   - appointments.types.ts: Appointment, AppointmentStatus, AppointmentFormData
   - appointments.service.ts: getAppointments, getAppointmentById, createAppointment, updateAppointmentStatus, getCalendarAppointments, generateQueueNumber, getDoctorAvailability
   - appointments.hooks.ts: full hooks for all service methods
   - pages/AppointmentsPage.tsx: list view with status filter, date range filter, doctor filter
   - pages/AppointmentCalendarPage.tsx: monthly/weekly/daily calendar view using a calendar grid component, color coded by status
   - pages/CreateAppointmentPage.tsx: step form — select customer, select pet, select service, select doctor, select date/time (shows available slots only), confirm
   - pages/AppointmentDetailPage.tsx: full detail, status update buttons based on current status flow, link to create medical record
   - components/AppointmentStatusBadge.tsx
   - components/QueueDisplay.tsx: large queue number display for waiting room

4. MEDICAL RECORD MODULE — src/features/medical-records/
   - medical-records.types.ts: MedicalRecord, SOAPData, Prescription, MedicalAttachment
   - medical-records.service.ts: getMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, addPrescription, removePrescription, uploadAttachment, removeAttachment
   - medical-records.hooks.ts: full hooks
   - pages/MedicalRecordsPage.tsx: list with pet name, doctor, date, type filter
   - pages/CreateMedicalRecordPage.tsx: SOAP form sections, dynamic prescription rows (add/remove), attachment upload
   - pages/MedicalRecordDetailPage.tsx: tabs — SOAP (formatted view), Prescription (table), Attachments (gallery/list), Follow Up
   - components/SOAPForm.tsx: reusable SOAP section component
   - components/PrescriptionForm.tsx: dynamic rows with add/remove
   - components/AttachmentGallery.tsx: grid view of attachments with download

5. VACCINATION MODULE — src/features/vaccinations/
   - vaccinations.types.ts: VaccinationRecord, VaccinationReminder, VaccineFormData
   - vaccinations.service.ts: getVaccinations, getVaccinationById, createVaccination, updateVaccination, generateCertificate, getUpcomingReminders
   - vaccinations.hooks.ts: full hooks
   - pages/VaccinationsPage.tsx: list with pet name, vaccine, date, next due, status indicator (overdue/upcoming/ok)
   - pages/CreateVaccinationPage.tsx: full form with auto-calculate next due date
   - pages/VaccinationDetailPage.tsx: detail + certificate download button
   - components/VaccinationStatusIndicator.tsx: overdue (red), due soon (yellow), ok (green)
   - components/VaccineCertificateButton.tsx: triggers PDF generation via Edge Function

6. MONITORING MODULE — src/features/monitoring/
   - monitoring.types.ts: WeightRecord, MedicationSchedule, MedicationLog, RecoveryNote, OwnerUpload
   - monitoring.service.ts: getWeightHistory, addWeightRecord, getMedicationSchedules, logMedication, getRecoveryNotes, addRecoveryNote, getOwnerUploads, reviewOwnerUpload
   - monitoring.hooks.ts: full hooks
   - pages/MonitoringDashboardPage.tsx: overview of all pets needing attention (medication due, recovery in progress, pending owner uploads)
   - pages/WeightTrackingPage.tsx: weight chart (recharts LineChart) per pet, add weight button
   - pages/MedicationTrackingPage.tsx: list of active medication schedules, log taken/skipped per dose
   - pages/RecoveryTrackingPage.tsx: recovery notes timeline per pet
   - components/WeightChart.tsx: responsive recharts line chart with weight history
   - components/MedicationScheduleCard.tsx: schedule with today's doses checklist
   - components/OwnerUploadReview.tsx: photo + note with approve/note response action for doctors

7. Write unit tests for all services and key components:
   - customers.service.test.ts: getCustomers pagination, createCustomer, updateCustomerStatus
   - pets.service.test.ts: createPet, getPetById, generateQRCode
   - appointments.service.test.ts: createAppointment, generateQueueNumber, getDoctorAvailability
   - medical-records.service.test.ts: createMedicalRecord with prescriptions, addPrescription, uploadAttachment
   - vaccinations.service.test.ts: createVaccination, generateCertificate
   - WeightChart.test.tsx: renders with data, renders empty state
   - AppointmentCalendarPage.test.tsx: renders calendar, navigates months
   - AppointmentStatusBadge.test.tsx: correct color per status

Complete every implementation. No TODOs. No stub functions.
```

---

**INSTRUKSI 5 of 6 — Operations, POS & Finance Modules**

```
This is instruction 5 of 6 for PetCare Suite. Build all operational modules completely: Inpatient, Grooming, Petshop, Inventory, POS, and Accounting. Every feature must be fully implemented.

HARD RULES:
- POS must work as a fully functional cashier interface — fast, keyboard-friendly, responsive.
- Pending bill for inpatient must integrate with POS discharge flow.
- Inventory and Petshop are separate modules but share stock data.
- No emoji. Lucide icons only.
- All currency formatted as IDR (Rp).

TASKS FOR THIS INSTRUCTION:

1. INPATIENT MODULE — src/features/inpatient/
   - inpatient.types.ts: InpatientRecord, Cage, DailyObservation, InpatientMedicationSchedule
   - inpatient.service.ts: getCages, getCageById, updateCageStatus, getInpatientRecords, getInpatientById, admitPet, dischargePet (triggers invoice creation), addDailyObservation, getDailyObservations, getInpatientMedications, updateMedicationStatus, getInpatientBill
   - inpatient.hooks.ts: full hooks
   - pages/InpatientDashboardPage.tsx: cage grid with status colors (available=green, occupied=amber, maintenance=red), occupied cages show pet name and days admitted
   - pages/CageManagementPage.tsx: CRUD cages, status management
   - pages/InpatientPatientsPage.tsx: list of current inpatients with admit date, cage, doctor, current bill amount
   - pages/InpatientDetailPage.tsx: tabs — Overview, Daily Observations (timeline), Medication Schedule (checklist per time slot), Billing (accumulated cost real-time), Daily Report (customer-visible view)
   - pages/AdmitPetPage.tsx: form to admit pet — select pet, cage, doctor, reason
   - pages/DischargePetPage.tsx: review accumulated bill, confirm payment method, discharge
   - components/CageStatusCard.tsx
   - components/DailyObservationForm.tsx
   - components/InpatientBillSummary.tsx: running total with line items

2. GROOMING MODULE — src/features/grooming/
   - grooming.types.ts: GroomingRecord, GroomingService
   - grooming.service.ts: getGroomingServices, getGroomingRecords, createGroomingBooking, updateGroomingStatus, completeGrooming (with photo upload)
   - grooming.hooks.ts: full hooks
   - pages/GroomingSchedulePage.tsx: calendar/list of today and upcoming grooming sessions
   - pages/GroomingBookingsPage.tsx: all bookings with status filter
   - pages/GroomingHistoryPage.tsx: completed records with before/after photos
   - components/GroomingStatusBadge.tsx

3. PETSHOP MODULE — src/features/petshop/
   - petshop.types.ts: Product, ProductVariant, ProductImage, ProductFormData
   - petshop.service.ts: getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories, getBrands, updateVariantStock
   - petshop.hooks.ts: full hooks
   - pages/PetshopDashboardPage.tsx: stats — total products, low stock count, top selling
   - pages/ProductsPage.tsx: table with thumbnail, name, category, brand, variants count, stock, price, status toggle
   - pages/CreateProductPage.tsx: form with gallery upload, dynamic variants (add/remove rows), category/brand select
   - pages/ProductDetailPage.tsx: full product view with variant table and stock levels
   - pages/EditProductPage.tsx
   - pages/CategoriesPage.tsx: CRUD categories
   - pages/BrandsPage.tsx: CRUD brands

4. INVENTORY MODULE — src/features/inventory/
   - inventory.types.ts: InventoryItem, InventoryBatch, StockMovement
   - inventory.service.ts: getItems, getItemById, createItem, updateItem, getBatches, addBatch, getStockMovements, adjustStock, getExpiringItems, getLowStockItems
   - inventory.hooks.ts: full hooks
   - pages/InventoryDashboardPage.tsx: alerts panel (low stock items, expiring soon items), total inventory value
   - pages/InventoryItemsPage.tsx: table with current stock, min stock indicator (red if below min), expiry status
   - pages/StockMovementPage.tsx: movement log with type filter (in/out/adjustment), date filter
   - pages/AdjustmentPage.tsx: form to manually adjust stock with reason
   - pages/ExpiryTrackingPage.tsx: items sorted by nearest expiry date, color coded (red=<30d, amber=<60d, yellow=<90d)
   - pages/BatchTrackingPage.tsx: batches per item with supplier and expiry

5. POS MODULE — src/features/pos/
   - pos.types.ts: CartItem, Cart, Invoice, InvoiceItem, PaymentData, RefundData
   - pos.service.ts: searchProducts, searchServices, createInvoice, getInvoices, getInvoiceById, processPayment, createRefund, getInpatientPendingBill, redeemLoyaltyPoints, calculateLoyaltyEarn
   - pos.hooks.ts: full hooks
   - pages/POSPage.tsx — MAIN CASHIER INTERFACE:
     * Left panel: product/service search with keyboard shortcut, recent items, category quick filter
     * Center panel: cart with line items, quantity +/-, remove, per-item discount
     * Right panel: customer select (optional), loyalty points display, order summary, discount input, payment section
     * Payment section: method tabs (Cash/Transfer/QRIS/Split), cash input with auto-calculated change
     * Checkout button: creates invoice, prints/sends receipt
     * Load pending bill button: pulls inpatient accumulated bill into cart
   - pages/TransactionsPage.tsx: invoice list with date filter, payment method filter, status filter, search by invoice number
   - pages/ReceiptPage.tsx: printable receipt view for a transaction
   - pages/RefundsPage.tsx: list of refunds, create refund from invoice
   - components/CartItem.tsx: line item with quantity controls and inline discount
   - components/PaymentPanel.tsx: payment method selection and amount input
   - components/ReceiptDocument.tsx: receipt layout for print/PDF

6. ACCOUNTING MODULE — src/features/accounting/
   - accounting.types.ts: Account, Transaction, ProfitLossReport, CashFlowReport
   - accounting.service.ts: getAccounts, createAccount, getTransactions, createTransaction, getIncomeReport, getExpenseReport, getProfitLoss, getCashFlow
   - accounting.hooks.ts: full hooks
   - pages/AccountingDashboardPage.tsx: monthly income vs expense bar chart (recharts), net profit card, recent transactions
   - pages/IncomePage.tsx: income transactions with source filter, date filter
   - pages/ExpensesPage.tsx: expense transactions with category filter, date filter, create expense button
   - pages/AccountsPage.tsx: chart of accounts CRUD
   - pages/CashflowPage.tsx: monthly cashflow chart + table
   - pages/ProfitLossPage.tsx: P&L statement by month/year with export option
   - components/IncomeExpenseChart.tsx: recharts BarChart comparing income vs expense per month

7. Write unit tests:
   - inpatient.service.test.ts: admitPet, dischargePet creates invoice, addDailyObservation
   - pos.service.test.ts: createInvoice with products, createInvoice with services, processPayment cash with change calculation, processPayment split, redeemLoyaltyPoints, getInpatientPendingBill
   - inventory.service.test.ts: adjustStock, getLowStockItems, getExpiringItems
   - POSPage.test.tsx: add item to cart, remove item, apply discount, select payment method, checkout
   - PaymentPanel.test.tsx: cash change calculation, split payment total validation
   - IncomeExpenseChart.test.tsx: renders with data

Complete every implementation. The POS interface must be fully operational.
```

---

**INSTRUKSI 6 of 6 — Notifications, Reports, Settings, Website & Final Polish**

```
This is instruction 6 of 6 for PetCare Suite. Complete the remaining modules: Notifications, Reports, Settings, Public Website, Customer Portal, and Doctor/Staff dashboards. Then perform final integration, polish, and test coverage completion.

HARD RULES:
- All integration configs (WhatsApp, Email) are stored in DB and managed from dashboard only. Never from .env.
- API keys must be masked in UI after saving. Show only last 4 characters.
- All charts use recharts. All icons use lucide-react. No emoji.
- After this instruction the app must be fully deployable with zero console errors and zero TypeScript errors.

TASKS FOR THIS INSTRUCTION:

1. NOTIFICATION MODULE — src/features/notifications/
   - notifications.types.ts: NotificationLog, NotificationTemplate, WhatsAppConfig, EmailConfig
   - notifications.service.ts: getNotificationLogs, retryNotification, getTemplates, updateTemplate, testWhatsApp, testEmail, getWhatsAppConfig, saveWhatsAppConfig, getEmailConfig, saveEmailConfig
   - notifications.hooks.ts: full hooks
   - pages/NotificationLogPage.tsx: table with channel (WA/Email badge), recipient, template, status (success=green/failed=red), sent_at, retry button for failed
   - pages/TemplatesPage.tsx: list of notification templates with edit (template body with variable placeholders like {{pet_name}}, {{date}})
   - pages/BroadcastPage.tsx: compose message, select recipient group (all customers, VIP only, customers with upcoming vaccination), preview, send

2. REPORTS MODULE — src/features/reports/
   - reports.service.ts: getClinicalReport, getFinancialReport, getInventoryReport, getProductReport, getDoctorReport
   - pages/ClinicalReportsPage.tsx: total patients per period, active patients, top 10 diagnoses (bar chart), new patients trend (line chart)
   - pages/FinancialReportsPage.tsx: revenue by service type (pie chart), monthly trend (line chart), summary cards (total revenue, total expense, net profit)
   - pages/InventoryReportsPage.tsx: stock value by category, movement history chart, low stock and expiring alerts list
   - pages/ProductReportsPage.tsx: best seller table (sorted by quantity sold), revenue per product
   - pages/DoctorReportsPage.tsx: per-doctor table (patient count, services performed, revenue contribution), period filter

3. SETTINGS MODULE — src/features/settings/
   - settings.service.ts: getClinicProfile, updateClinicProfile, getBusinessHours, updateBusinessHours, getInvoiceSettings, updateInvoiceSettings, getWhatsAppSettings, saveWhatsAppSettings, getEmailSettings, saveEmailSettings, getThemeSettings, saveThemeSettings, getModules, toggleModule
   - pages/ClinicProfilePage.tsx: clinic name, logo upload, address, phone, description
   - pages/BusinessHoursPage.tsx: per-day toggle + time range picker, special holidays list
   - pages/InvoiceSettingsPage.tsx: invoice prefix, next number, header text, footer text, preview
   - pages/WhatsAppSettingsPage.tsx:
     * Provider select: Fonnte or Wablas
     * API Key input — masked after save (show only last 4 chars, reveal toggle)
     * Sender number input
     * Connection status indicator: Connected / Not Configured / Error
     * Test Send button: input test number, send test message, show result inline
   - pages/EmailSettingsPage.tsx:
     * SMTP Host, Port, Username, Password (masked), From Email, From Name
     * Connection status indicator
     * Test Send button: input test email, send, show result inline
   - pages/ThemeSettingsPage.tsx: light/dark mode default, accent color picker
   - pages/ModuleManagerPage.tsx: card grid per module, toggle switch, module description, dependency warning if disabling affects other modules
   - pages/AuditLogPage.tsx: table with user, action, table, record id, old/new value diff viewer, timestamp, IP

4. PUBLIC WEBSITE MODULE — src/features/website/
   - website.service.ts: getWebsiteContent, updateWebsiteContent, getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle, getTestimonials, manageTestimonial
   - Admin pages (under /dashboard/website/):
     * WebsiteContentPage.tsx: edit hero text, services section, contact info
     * ArticlesPage.tsx: CRUD articles with rich text editor (use a simple textarea with markdown preview)
     * TestimonialsPage.tsx: CRUD testimonials with active toggle
   - Public pages (under /):
     * HomePage.tsx: hero banner, services overview, featured doctors, testimonials, latest articles, contact CTA
     * ServicesPage.tsx + ServiceDetailPage.tsx
     * DoctorsPage.tsx + DoctorDetailPage.tsx
     * ShopPage.tsx + ProductDetailPage.tsx + CategoryPage.tsx
     * ArticlesPage.tsx + ArticleDetailPage.tsx
     * ContactPage.tsx: contact form, map embed slot, clinic hours
     * BookingPage.tsx: public online booking form (same step flow as internal create appointment)
     * PublicLayout.tsx: navbar with logo, navigation links, login button

5. CUSTOMER PORTAL — src/features/portal/
   - portal.service.ts: wraps existing services but scoped to current customer's data only
   - pages/PortalDashboardPage.tsx: widgets — upcoming appointments, vaccination reminders, medication reminders due today, recent activity
   - pages/PortalPetsPage.tsx: list of customer's pets
   - pages/PortalPetProfilePage.tsx: tabs — Overview, Medical History (read only), Vaccination (read only + certificate download), Monitoring (weight chart + owner upload form), Timeline, Documents
   - pages/PortalBookingsPage.tsx: booking history + new booking button
   - pages/PortalInpatientPage.tsx: active inpatient status, daily reports
   - pages/PortalGroomingPage.tsx: grooming history
   - pages/PortalInvoicesPage.tsx: invoice list with download PDF button
   - pages/PortalNotificationsPage.tsx: notification history
   - pages/PortalProfilePage.tsx: edit own profile, change password
   - PortalLayout.tsx: simpler sidebar/navbar tailored for customers

6. ROLE-SPECIFIC DASHBOARDS:
   - pages/owner/OwnerDashboardPage.tsx:
     * widgets: Revenue Today, Appointments Today, Active Inpatients, Low Stock Alert, Vaccination Reminders Due, Pending Payments
     * charts: weekly revenue line chart, appointment status donut chart
     * Active modules status cards
   - pages/doctor/DoctorDashboardPage.tsx: today's appointments queue, recent medical records, pets in monitoring, inpatient list
   - pages/staff/StaffDashboardPage.tsx: today's appointments, POS quick access, inventory alerts, grooming schedule

7. FINAL INTEGRATION TASKS:
   - Verify all Supabase Realtime subscriptions work: notification badge updates live, queue display updates live, inpatient cage status updates live
   - Verify module toggle: disabling a module hides its nav items and blocks its routes with a "Module Disabled" page
   - Verify RLS: test each role can only access permitted data
   - Verify WhatsApp notification fires on: appointment confirmed, vaccination reminder, medication reminder, inpatient daily report, discharge
   - Verify loyalty points: earn on POS checkout, deduct on redemption, balance always accurate
   - Verify pending bill: inpatient bill accumulates correctly, POS discharge flow loads correct total

8. FINAL POLISH:
   - All pages have correct document title (useDocumentTitle hook)
   - All forms reset properly after successful submit
   - All modals close properly after action
   - Back navigation works correctly on all detail pages
   - Print stylesheet for receipt and vaccine certificate
   - 404 handling for invalid IDs (redirect to list page with toast)
   - Loading indicators on all navigation transitions

9. Write final unit tests:
   - settings.service.test.ts: saveWhatsAppSettings, testWhatsApp Fonnte success, testWhatsApp invalid config, saveEmailSettings, testEmail
   - ModuleManagerPage.test.tsx: toggle module on, toggle module off, dependency warning
   - PortalPetProfilePage.test.tsx: renders tabs, cannot see other customer data
   - OwnerDashboardPage.test.tsx: renders all widgets, shows correct revenue
   - notifications.service.test.ts: retryNotification, broadcast to segment

10. Pre-deploy checklist — verify and fix all of:
    - Zero TypeScript errors (tsc --noEmit passes)
    - Zero ESLint errors
    - All Vitest tests pass
    - No console.log left in production code
    - All environment variables documented in .env.example
    - Supabase migrations run cleanly in order
    - Vercel build succeeds (npm run build produces no errors)

After this instruction PetCare Suite must be fully operational, fully tested, and ready to deploy.
```

---

