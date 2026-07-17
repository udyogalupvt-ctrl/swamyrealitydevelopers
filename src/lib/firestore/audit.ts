import {
  addDoc,
  collection,
  getDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export type AuditAction = "create" | "update" | "delete";
export type AuditEntity = "property" | "blogPost" | "galleryImage" | "heroConfig";

export type AuditLogDoc = {
  id: string;
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  label: string;
  actorUid: string | null;
  actorEmail: string | null;
  createdAt?: Timestamp;
};

const COLLECTION_FOR_ENTITY: Record<AuditEntity, string> = {
  property: "properties",
  blogPost: "blogPosts",
  galleryImage: "galleryImages",
  heroConfig: "settings",
};

const LABEL_FIELDS: Record<AuditEntity, string[]> = {
  property: ["name", "slug"],
  blogPost: ["title", "slug"],
  galleryImage: ["title", "category"],
  heroConfig: ["title1", "subtitle"],
};

function pickLabel(entity: AuditEntity, data: Record<string, unknown> | null | undefined): string {
  if (!data) return "";
  for (const f of LABEL_FIELDS[entity]) {
    const v = data[f];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

async function fetchLabel(entity: AuditEntity, id: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, COLLECTION_FOR_ENTITY[entity], id));
    if (!snap.exists()) return "";
    return pickLabel(entity, snap.data() as Record<string, unknown>);
  } catch {
    return "";
  }
}

export async function writeAuditLog(params: {
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  /** Provide a data payload to derive label from (create/update). Omit for delete to fetch by id. */
  data?: Record<string, unknown> | null;
  /** Optional explicit label override (e.g. for delete when doc is already gone). */
  label?: string;
}) {
  try {
    const u = auth.currentUser;
    let label = params.label ?? pickLabel(params.entity, params.data);
    if (!label) label = await fetchLabel(params.entity, params.entityId);
    await addDoc(collection(db, "auditLogs"), {
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      label: label || "(untitled)",
      actorUid: u?.uid ?? null,
      actorEmail: u?.email ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Audit logging must never break the primary action.
    // eslint-disable-next-line no-console
    console.warn("audit log failed", err);
  }
}
