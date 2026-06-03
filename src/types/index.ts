export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "REPO_ADMIN"
  | "MANAGER"
  | "CONTRIBUTOR"
  | "REVIEWER"
  | "VIEWER"
  | "EXTERNAL_GUEST"

export type Permission =
  | "VIEW"
  | "CREATE"
  | "EDIT"
  | "DELETE"
  | "SHARE"
  | "DOWNLOAD"
  | "APPROVE"
  | "SIGN"
  | "ARCHIVE"
  | "MANAGE_USERS"

export type FileStatus = "ACTIVE" | "ARCHIVED" | "DELETED" | "CHECKED_OUT"
export type WorkflowStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
export type SignatureStatus = "PENDING" | "SIGNED" | "DECLINED" | "EXPIRED"
export type NotificationType =
  | "FILE_SHARED"
  | "COMMENT_MENTION"
  | "APPROVAL_REQUEST"
  | "SIGNATURE_REQUEST"
  | "WORKFLOW_COMPLETE"
  | "FILE_UPLOAD"
  | "SYSTEM_ALERT"

export interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: UserRole
  isActive: boolean
  mfaEnabled: boolean
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  domain?: string | null
  plan: string
  isActive: boolean
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  name: string
  description?: string | null
  organizationId: string
  parentId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Repository {
  id: string
  name: string
  description?: string | null
  organizationId: string
  departmentId?: string | null
  driveRootFolderId?: string | null
  driveRootFolderPath?: string | null
  isPublic: boolean
  isArchived: boolean
  template?: string | null
  retentionDays?: number | null
  settings: Record<string, unknown>
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  _count?: {
    documents: number
    folders: number
  }
}

export interface Folder {
  id: string
  name: string
  repositoryId: string
  parentId?: string | null
  driveId?: string | null
  path: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  children?: Folder[]
  documents?: Document[]
}

export interface Document {
  id: string
  name: string
  description?: string | null
  repositoryId: string
  folderId?: string | null
  driveFileId: string
  driveWebViewLink?: string | null
  driveDownloadLink?: string | null
  mimeType: string
  fileSize: bigint
  extension?: string | null
  version: number
  status: FileStatus
  tags: string[]
  metadata: Record<string, unknown>
  uploadedById: string
  ownedById: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  uploadedBy?: User
  ownedBy?: User
}

export interface Comment {
  id: string
  content: string
  documentId: string
  authorId: string
  parentId?: string | null
  mentions: string[]
  isResolved: boolean
  createdAt: Date
  updatedAt: Date
  author?: User
  replies?: Comment[]
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

export interface Workflow {
  id: string
  name: string
  description?: string | null
  repositoryId: string
  trigger: Record<string, unknown>
  steps: Record<string, unknown>
  status: WorkflowStatus
  template?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SignatureRequest {
  id: string
  documentId: string
  requestedById: string
  title: string
  message?: string | null
  status: WorkflowStatus
  dueDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  document?: Document
  requestedBy?: User
  signatures?: Signature[]
}

export interface Signature {
  id: string
  signatureRequestId: string
  signerId: string
  status: SignatureStatus
  signedAt?: Date | null
  signatureData?: string | null
  ipAddress?: string | null
  order: number
  createdAt: Date
  signer?: User
}

export interface AuditLog {
  id: string
  action: string
  userId?: string | null
  organizationId?: string | null
  resourceId?: string | null
  resourceType?: string | null
  details: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  user?: User
}

export interface DashboardStats {
  totalDocuments: number
  totalStorage: number
  activeUsers: number
  pendingApprovals: number
  documentGrowth: number
  storageGrowth: number
  userGrowth: number
}

export interface ActivityItem {
  id: string
  action: string
  user: User
  resource: string
  resourceType: string
  timestamp: Date
}

export interface StorageData {
  name: string
  used: number
  total: number
}

export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}
