"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSecurityAuditLog } from "@/lib/server/auth-store";
import {
  createPropertyInD1,
  createTowingCompanyInD1,
  createUserInD1,
  updatePropertyInD1,
  updateTowingCompanyInD1,
  updateUserInD1
} from "@/lib/server/d1-management-store";

export async function createCloudflareUserAction(formData: FormData) {
  const session = await requireRole(["Admin"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "Viewer").trim();
  const property = String(formData.get("property") || "").trim();
  const status = String(formData.get("status") || "Active").trim();
  const password = String(formData.get("password") || "").trim();

  const userId = await createUserInD1({
    name,
    email,
    role,
    property,
    status,
    password
  });

  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: "admin.user_created",
    targetType: "user",
    targetId: userId,
    detail: `Created user ${email} with role ${role}.`
  });

  revalidatePath("/users");
  revalidatePath("/cf/admin/users");
  redirect("/cf/admin/users?status=created");
}

export async function updateCloudflareUserAction(id: string, formData: FormData) {
  const session = await requireRole(["Admin"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "Viewer").trim();
  const property = String(formData.get("property") || "").trim();
  const status = String(formData.get("status") || "Active").trim();
  const password = String(formData.get("password") || "").trim();

  await updateUserInD1(id, { name, email, role, property, status, password });

  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: status === "Active" ? "admin.user_updated" : "admin.user_deactivated",
    targetType: "user",
    targetId: id,
    detail: `${status === "Active" ? "Updated" : "Deactivated"} user ${email}.`
  });

  revalidatePath("/users");
  revalidatePath("/cf/admin/users");
  revalidatePath(`/cf/admin/users/${id}`);
  redirect(`/cf/admin/users/${id}?status=saved`);
}

export async function createCloudflarePropertyAction(formData: FormData) {
  const session = await requireRole(["Admin"]);

  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const zonesCsv = String(formData.get("zonesCsv") || "").trim();
  const towingRules = String(formData.get("towingRules") || "").trim();
  const defaultTowCompany = String(formData.get("defaultTowCompany") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const propertyId = await createPropertyInD1({
    name,
    code,
    address,
    zonesCsv,
    towingRules,
    defaultTowCompany,
    notes
  });

  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: "admin.property_created",
    targetType: "property",
    targetId: propertyId,
    detail: `Created property ${name}.`
  });

  revalidatePath("/properties");
  revalidatePath("/cf/admin/properties");
  revalidatePath("/vehicles/new");
  revalidatePath("/cf/vehicles/new");
  redirect("/cf/admin/properties?status=created");
}

export async function updateCloudflarePropertyAction(id: string, formData: FormData) {
  const session = await requireRole(["Admin"]);

  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const zonesCsv = String(formData.get("zonesCsv") || "").trim();
  const towingRules = String(formData.get("towingRules") || "").trim();
  const defaultTowCompany = String(formData.get("defaultTowCompany") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const active = String(formData.get("active") || "") === "on";

  await updatePropertyInD1(id, {
    name,
    code,
    address,
    zonesCsv,
    towingRules,
    defaultTowCompany,
    notes,
    active
  });

  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: active ? "admin.property_updated" : "admin.property_deactivated",
    targetType: "property",
    targetId: id,
    detail: `${active ? "Updated" : "Deactivated"} property ${name}.`
  });

  revalidatePath("/properties");
  revalidatePath("/cf/admin/properties");
  revalidatePath(`/cf/admin/properties/${id}`);
  revalidatePath("/vehicles/new");
  revalidatePath("/cf/vehicles/new");
  redirect(`/cf/admin/properties/${id}?status=saved`);
}

export async function createCloudflareTowingCompanyAction(formData: FormData) {
  const session = await requireRole(["Admin"]);

  const companyName = String(formData.get("companyName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const dispatchContact = String(formData.get("dispatchContact") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const active = String(formData.get("active") || "on") === "on";

  const companyId = await createTowingCompanyInD1({
    companyName,
    phone,
    email,
    dispatchContact,
    notes,
    active
  });

  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: "admin.towing_company_created",
    targetType: "towing_company",
    targetId: companyId,
    detail: `Created towing company ${companyName}.`
  });

  revalidatePath("/cf/admin/towing-companies");
  revalidatePath("/cf/admin/properties");
  revalidatePath("/vehicles/new");
  revalidatePath("/cf/vehicles/new");
  redirect("/cf/admin/towing-companies?status=created");
}

export async function updateCloudflareTowingCompanyAction(id: string, formData: FormData) {
  const session = await requireRole(["Admin"]);

  const companyName = String(formData.get("companyName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const dispatchContact = String(formData.get("dispatchContact") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const active = String(formData.get("active") || "") === "on";

  await updateTowingCompanyInD1(id, {
    companyName,
    phone,
    email,
    dispatchContact,
    notes,
    active
  });

  await createSecurityAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    action: active ? "admin.towing_company_updated" : "admin.towing_company_deactivated",
    targetType: "towing_company",
    targetId: id,
    detail: `${active ? "Updated" : "Deactivated"} towing company ${companyName}.`
  });

  revalidatePath("/cf/admin/towing-companies");
  revalidatePath(`/cf/admin/towing-companies/${id}`);
  revalidatePath("/cf/admin/properties");
  revalidatePath("/vehicles/new");
  revalidatePath("/cf/vehicles/new");
  redirect(`/cf/admin/towing-companies/${id}?status=saved`);
}
