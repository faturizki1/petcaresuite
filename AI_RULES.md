AI_RULES.md

Purpose

This repository is governed by the SSOT (Single Source of Truth) documents inside "/dokumen".

GitHub Copilot, Copilot Chat, Claude, GPT, Cursor, Cline, Roo and any AI coding agent MUST follow these rules.

---

Documentation Hierarchy

Priority order:

1. dokumen/01_PRODUCT_SPECIFICATION.md
2. dokumen/02_DATABASE_SPECIFICATION.md
3. dokumen/03_RLS_AND_SECURITY_SPECIFICATION.md
4. dokumen/04_FRONTEND_ARCHITECTURE.md
5. dokumen/05_BACKEND_ARCHITECTURE.md
6. dokumen/06_DATABASE_SCHEMA.md
7. dokumen/07_RLS_SECURITY_SPEC.md
8. dokumen/08_FRONTEND_ARCHITECTURE.md
9. dokumen/09_BACKEND_IMPLEMENTATION.md
10. dokumen/10_DATABASE_MIGRATION_MASTER.md
11. dokumen/11_UI_UX_DESIGN_SYSTEM.md
12. dokumen/12_API_SERVICE_CONTRACTS.md

If implementation differs from documentation:

DOCUMENTATION WINS.

---

Forbidden

Do not:

- Change tech stack
- Change database schema
- Change folder structure
- Add new dependencies without approval
- Use auth.role()
- Access Supabase directly from React pages
- Use any TypeScript any
- Create undocumented tables
- Create undocumented routes

---

Mandatory

Always:

- Follow service layer architecture
- Follow DTO contracts
- Follow API contracts
- Follow role permissions
- Follow RLS specification
- Follow UI design system
- Follow module architecture
- Follow migration numbering

---

Before Implementing

Read all relevant documentation files first.

Then:

1. Explain implementation plan
2. Mention impacted files
3. Mention impacted tables
4. Mention impacted routes
5. Then generate code

Never generate code directly without analysis.
