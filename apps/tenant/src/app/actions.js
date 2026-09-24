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

    const description = (formData.get("description") ?? "").toString().trim();
    if (!description) throw new Error("Describe the issue before submitting");

    const request = await createRequest({
      unitId: unit.id,
      category,
      summary: description.length > 60 ? `${description.slice(0, 57)}…` : description,
      description,
      photos: await readPhotos(formData),
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
    const summary = formData.get("label");
    if (!category || !summary) throw new Error("Choose a service first");

    const request = await createRequest({
      unitId: unit.id,
      category,
      summary,
      scheduledDate: formData.get("scheduledDate") || null,
      scheduledSlot: formData.get("scheduledSlot") || null,
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
    const number = (formData.get("phone") ?? "").toString().trim();
    if (!number) throw new Error("Enter your mobile number");
    await startSignIn(`${formData.get("countryCode") ?? ""} ${number}`);
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
