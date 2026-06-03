# LookUp DMS — Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│  Browser (Next.js PWA)  │  Desktop App  │  Mobile (PWA)         │
└─────────────┬───────────────────────────────────────────────────┘
              │ HTTPS
┌─────────────▼──────────────────────────────────────────────────┐
│                    Vercel Edge Network                          │
│   Next.js App Router  │  API Routes  │  Middleware (Auth)      │
└─────────────┬────────────────────┬────────────────────────────┘
              │                    │
    ┌─────────▼─────┐    ┌────────▼───────┐
    │  Neon Postgres│    │  Google Drive  │
    │  (via Prisma) │    │  (File Storage)│
    └───────────────┘    └────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  External Services         │
    │  OpenAI  │  Resend  │ Auth │
    └────────────────────────────┘
```

---

## Multi-Tenant Data Isolation

Each tenant (Organization) has isolated data:
- All documents scoped to `organizationId`
- Repositories belong to one organization
- User-organization membership via `UserOrganization` junction table
- Row-level security enforced in API middleware

---

## Google Drive Folder Structure

```
Root Folder (GOOGLE_DRIVE_ROOT_FOLDER_ID)
└── {org-slug}/
    ├── {repo-id}/
    │   ├── {folder-id}/
    │   │   └── document.pdf
    │   └── document.docx
    └── {repo-id-2}/
```

---

## RBAC Permissions Matrix

| Role           | View | Create | Edit | Delete | Share | Approve | Manage Users |
|----------------|------|--------|------|--------|-------|---------|--------------|
| SUPER_ADMIN    | ✓    | ✓      | ✓    | ✓      | ✓     | ✓       | ✓            |
| ORG_ADMIN      | ✓    | ✓      | ✓    | ✓      | ✓     | ✓       | ✓            |
| REPO_ADMIN     | ✓    | ✓      | ✓    | ✓      | ✓     | ✓       | —            |
| MANAGER        | ✓    | ✓      | ✓    | —      | ✓     | ✓       | —            |
| CONTRIBUTOR    | ✓    | ✓      | ✓    | —      | —     | —       | —            |
| REVIEWER       | ✓    | —      | —    | —      | —     | ✓       | —            |
| VIEWER         | ✓    | —      | —    | —      | —     | —       | —            |
| EXTERNAL_GUEST | ✓    | —      | —    | —      | —     | —       | —            |

---

## API Route Inventory

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/documents` | List/upload documents |
| GET/PATCH/DELETE | `/api/documents/[id]` | Document CRUD |
| GET/POST | `/api/repositories` | List/create repositories |
| GET/PATCH/DELETE | `/api/repositories/[id]` | Repository CRUD |
| GET/POST | `/api/folders` | List/create folders |
| GET/POST | `/api/comments` | Document comments |
| GET/POST | `/api/users` | User management |
| GET | `/api/analytics` | Analytics aggregation |
| GET | `/api/export` | CSV/report export |
| GET/POST | `/api/signatures` | E-signature requests |
| GET/POST | `/api/workflows` | Workflow management |
| GET/POST | `/api/notes` | Notes CRUD |
| GET/POST | `/api/notifications` | Notifications |
| POST | `/api/ai/summarize` | AI document summary |
| GET/POST | `/api/migration` | Migration jobs |
| GET/POST | `/api/desktop/sync` | Desktop sync |
| POST | `/api/desktop/auth` | Desktop auth token |

---

## Database Schema Overview

**Core entities:**
- `Organization` → top-level tenant
- `User` → platform user
- `UserOrganization` → user-org membership with role
- `Repository` → document collection within org
- `Folder` → hierarchical folder within repo
- `Document` → file metadata (actual file in Google Drive)
- `DocumentVersion` → version history

**Feature entities:**
- `Comment` → threaded comments on documents
- `SignatureRequest` + `Signature` → e-signature workflow
- `Workflow` + `WorkflowInstance` → automation
- `Note` + `NoteCollaborator` → collaborative notes
- `Whiteboard` → visual collaboration
- `Notification` → in-app notifications
- `AuditLog` → full audit trail
- `AiDocumentSummary` → AI-generated summaries
