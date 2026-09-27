"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  pendingSignIn,
  register,
  signOut,
  startSignIn,
  verifyCode,
} from "@aqarly/core/auth";
import { phoneFrom } from "@aqarly/core/phone";
import {
  createRequest,
  getSignedInTenant,
  maxRequestPhotos,
} from "@aqarly/core/operations";

// Mirrors the ops portal's write layer: the mutation lives in `packages/core`,
// this only translates form data and revalidates. Every write asks who is
// signed in (`getSignedInTenant()`), never trusting a form to say.

function fail(error) {
  return { ok: false, error: error.message ?? "Something went wrong" };
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function uploadedFiles(formData, name) {
  return formData
    .getAll(name)
    .filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);
}

async function inlinePhoto(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} isn't an image`);
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error(
      `${file.name} is larger than ${Math.round(MAX_PHOTO_BYTES / (1024 * 1024))} MB`,
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

async function readPhotos(formData) {
  const files = uploadedFiles(formData, "photos");

  if (files.length > maxRequestPhotos) {
    throw new Error(`Up to ${maxRequestPhotos} photos per request`);
  }

  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      dataUrl: await inlinePhoto(file),
    })),
  );
}

function text(formData, name) {
  return (formData.get(name) ?? "").toString().trim();
}

// The visit the tenant asked for: a day and a "9AM–1PM" window, both or
// neither (the API refuses one without the other, and says so).
function visit(formData) {
  return {
    scheduledDate: text(formData, "scheduledDate") || null,
    scheduledSlot: text(formData, "scheduledSlot") || null,
  };
}

async function signedInUnit() {
  const tenant = await getSignedInTenant();
  if (!tenant?.unit) throw new Error("No unit on file for this account");
  return tenant.unit;
}

export async function createMaintenanceRequestAction(formData) {
  try {
    const unit = await signedInUnit();

    const category = formData.get("category");
    if (!category) throw new Error("Choose a category first");

    const summary = text(formData, "summary");
    if (!summary) throw new Error("Give the request a short title");

    const request = await createRequest({
      unitId: unit.id,
      category,
      priority: formData.get("priority") === "urgent" ? "urgent" : "normal",
      summary,
      description: text(formData, "description"),
      photos: await readPhotos(formData),
      ...visit(formData),
      origin: "tenant",
    });

    revalidateAll();
    return { ok: true, id: request.id };
  } catch (error) {
    return fail(error);
  }
}

export async function createHousekeepingRequestAction(formData) {
  try {
    const unit = await signedInUnit();

    const category = formData.get("category");
    if (!category) throw new Error("Choose a service first");

    const { scheduledDate, scheduledSlot } = visit(formData);
    if (!scheduledDate || !scheduledSlot) throw new Error("Pick a day and a time window");

    const request = await createRequest({
      unitId: unit.id,
      category,
      // Blank means the service's own name, which the form starts with.
      summary: text(formData, "summary") || (formData.get("label") ?? "").toString(),
      description: text(formData, "description"),
      photos: await readPhotos(formData),
      scheduledDate,
      scheduledSlot,
      origin: "tenant",
    });

    revalidateAll();
    return { ok: true, id: request.id };
  } catch (error) {
    return fail(error);
  }
}

// --- Signing in -------------------------------------------------------------
// Phone → code → (first time) profile. aqarly-api checks everything; its
// refusals ("That code isn't right…") come back as the error to show.

// Where a proved phone goes next.
function nextFor(me) {
  if (me.kind === "tenant") return "/";
  if (me.kind === "new") return "/login/register";
  return "/login/waiting";
}

export async function sendCodeAction(formData) {
  try {
    const country = (formData.get("country") ?? "").toString();
    await startSignIn(phoneFrom(country, (formData.get("phone") ?? "").toString()));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function resendCodeAction() {
  try {
    const pending = await pendingSignIn();
    if (!pending) throw new Error("That sign-in has expired. Enter your number again.");
    await startSignIn(pending.phone);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function verifyCodeAction(formData) {
  try {
    const me = await verifyCode((formData.get("code") ?? "").toString());
    return { ok: true, next: nextFor(me) };
  } catch (error) {
    return fail(error);
  }
}

export async function registerAction(formData) {
  try {
    const name = (formData.get("name") ?? "").toString();
    const unitId = (formData.get("unitId") ?? "").toString();
    if (!unitId) throw new Error("Choose your building and unit");
    const me = await register(name, unitId);
    return { ok: true, next: nextFor(me) };
  } catch (error) {
    return fail(error);
  }
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}
