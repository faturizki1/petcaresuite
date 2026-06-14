# Supabase Deployment Guide

## 1. Create Project
supabase.com → New project. Copy URL + anon key to .env.

## 2. Link & Migrate
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase db seed

## 3. Storage Buckets (Supabase Dashboard → Storage)
pet-photos (public), clinic-assets (public), avatars (public)
medical-attachments (private), grooming-photos (private), owner-uploads (private), documents (private)

## 4. Deploy Edge Functions
supabase functions deploy send-whatsapp
supabase functions deploy send-email
supabase functions deploy generate-queue
supabase functions deploy generate-pdf

## 5. Create First Owner
Supabase Dashboard → Auth → Users → Add user (email + password)
Table Editor → profiles → set role = 'owner' for that row.
Login at https://your-app.vercel.app/login

## 6. Post-Login Setup
Settings → Clinic Profile → fill details
Settings → WhatsApp → add provider + API key
Settings → Email → add SMTP config
Settings → Module Manager → enable modules