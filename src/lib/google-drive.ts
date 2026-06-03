import { google } from "googleapis"
import { Readable } from "stream"

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  })
}

function getDriveClient() {
  const auth = getAuth()
  return google.drive({ version: "v3", auth })
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  webViewLink?: string
  webContentLink?: string
  createdTime?: string
  modifiedTime?: string
  parents?: string[]
}

export interface DriveFolder {
  id: string
  name: string
  webViewLink?: string
}

export async function createFolder(
  name: string,
  parentId?: string
): Promise<DriveFolder> {
  const drive = getDriveClient()
  const metadata: {
    name: string
    mimeType: string
    parents?: string[]
  } = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  }
  if (parentId) metadata.parents = [parentId]

  const res = await drive.files.create({
    requestBody: metadata,
    fields: "id, name, webViewLink",
  })

  return {
    id: res.data.id!,
    name: res.data.name!,
    webViewLink: res.data.webViewLink ?? undefined,
  }
}

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<DriveFile> {
  const drive = getDriveClient()
  const metadata: {
    name: string
    parents?: string[]
  } = { name: fileName }
  if (folderId) metadata.parents = [folderId]

  const stream = Readable.from(fileBuffer)
  const res = await drive.files.create({
    requestBody: metadata,
    media: { mimeType, body: stream },
    fields: "id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime",
  })

  return {
    id: res.data.id!,
    name: res.data.name!,
    mimeType: res.data.mimeType!,
    size: res.data.size ?? undefined,
    webViewLink: res.data.webViewLink ?? undefined,
    webContentLink: res.data.webContentLink ?? undefined,
    createdTime: res.data.createdTime ?? undefined,
    modifiedTime: res.data.modifiedTime ?? undefined,
  }
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const drive = getDriveClient()
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  )
  return Buffer.from(res.data as ArrayBuffer)
}

export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDriveClient()
  await drive.files.delete({ fileId })
}

export async function getFileMetadata(fileId: string): Promise<DriveFile> {
  const drive = getDriveClient()
  const res = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime, parents",
  })
  return {
    id: res.data.id!,
    name: res.data.name!,
    mimeType: res.data.mimeType!,
    size: res.data.size ?? undefined,
    webViewLink: res.data.webViewLink ?? undefined,
    webContentLink: res.data.webContentLink ?? undefined,
    createdTime: res.data.createdTime ?? undefined,
    modifiedTime: res.data.modifiedTime ?? undefined,
    parents: res.data.parents ?? undefined,
  }
}

export async function moveFile(
  fileId: string,
  newFolderId: string
): Promise<DriveFile> {
  const drive = getDriveClient()
  const file = await getFileMetadata(fileId)
  const previousParents = file.parents?.join(",") ?? ""

  const res = await drive.files.update({
    fileId,
    addParents: newFolderId,
    removeParents: previousParents,
    fields: "id, name, mimeType, size, webViewLink, parents",
  })

  return {
    id: res.data.id!,
    name: res.data.name!,
    mimeType: res.data.mimeType!,
    size: res.data.size ?? undefined,
    webViewLink: res.data.webViewLink ?? undefined,
    parents: res.data.parents ?? undefined,
  }
}

export async function copyFile(
  fileId: string,
  newFolderId: string,
  newName?: string
): Promise<DriveFile> {
  const drive = getDriveClient()
  const res = await drive.files.copy({
    fileId,
    requestBody: {
      parents: [newFolderId],
      name: newName,
    },
    fields: "id, name, mimeType, size, webViewLink",
  })

  return {
    id: res.data.id!,
    name: res.data.name!,
    mimeType: res.data.mimeType!,
    size: res.data.size ?? undefined,
    webViewLink: res.data.webViewLink ?? undefined,
  }
}

export async function createDMSRootFolder(): Promise<DriveFolder> {
  return createFolder("LookUp DMS")
}

export async function getOrCreateOrgFolder(
  orgName: string,
  orgId: string,
  rootFolderId?: string
): Promise<DriveFolder> {
  const parentId = rootFolderId ?? process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  return createFolder(`${orgName} [${orgId}]`, parentId)
}

export async function getOrCreateRepoFolder(
  repoName: string,
  repoId: string,
  orgFolderId: string
): Promise<DriveFolder> {
  return createFolder(`${repoName} [${repoId}]`, orgFolderId)
}

export async function listFiles(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient()
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime)",
    orderBy: "name",
  })
  return (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType!,
    size: f.size ?? undefined,
    webViewLink: f.webViewLink ?? undefined,
    webContentLink: f.webContentLink ?? undefined,
    createdTime: f.createdTime ?? undefined,
    modifiedTime: f.modifiedTime ?? undefined,
  }))
}

export async function shareFile(
  fileId: string,
  email: string,
  role: "reader" | "writer" | "commenter" = "reader"
): Promise<void> {
  const drive = getDriveClient()
  await drive.permissions.create({
    fileId,
    requestBody: { type: "user", role, emailAddress: email },
  })
}
