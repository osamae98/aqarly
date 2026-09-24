"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMe, pendingSignIn, signOut, startSignIn, verifyCode } from "@aqarly/core/auth";
import {
  completeRequest,
  handBackRequest,
  maxCompletionPhotos,
  requiredCompletionPhotos,
  startRequest,
} from "@aqarly/core/operations";

// Every write the field app makes goes through here. The mutation itself
// belongs to `packages/core`, which sends it to aqarly-api; this layer only
// translates form data, names the technician making the change, and tells
// Next what to re-render. An API refusal arrives as an Error whose message is
// meant for the technician, and `fail` passes it to the screen unchanged.

// Field routes are `force-dynamic`, but the router cache still holds rendered
// segments, so a write has to invalidate the whole tree.
function revalidateAll() {
  revalidatePath("/", "layout");
}

function fail(error) {
  return { ok: false, error: error.message ?? "Something went wrong" };
}

// Every action starts by asking the session who is signed in, never the
// form: a form that carried its own identity would let any job be closed as
// anyone. (The API checks it again.) Not `getSignedInTechnician`, whose
// redirect is a thrown signal that `fail` would swallow.
async function signedIn() {
  const me = await getMe();
  if (me?.kind !== "staff" || !me.staff) {
    throw new Error("You've been signed out. Sign in again to carry on.");
  }
  return me.staff;
}

// There is no file store yet, so a photo posts with the form and is inlined
// as a data URL alongside the job it closes. That only stays reasonable while
// the files are small, which is what this cap is standing in for.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function inlinePhoto(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} isn't a photo`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name} is larger than 5 MB`);
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

async function readPhotos(formData) {
  const files = formData
    .getAll("photos")
    .filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);

  if (files.length < requiredCompletionPhotos) {
    throw new Error(
      `Attach at least ${requiredCompletionPhotos} photos to close this job`,
    );
  }
  if (files.length > maxCompletionPhotos) {
    throw new Error(`Up to ${maxCompletionPhotos} photos per job`);
  }

  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      dataUrl: await inlinePhoto(file),
    })),
  );
}

export async function startJobAction(formData) {
  try {
    const technician = await signedIn();
    const job = await startRequest(formData.get("id"), technician.id);

    revalidateAll();
    return { ok: true, id: job.id, message: "Job started" };
  } catch (error) {
    return fail(error);
  }
}

export async function completeJobAction(formData) {
  try {
    const technician = await signedIn();
    const job = await completeRequest(formData.get("id"), technician.id, {
      notes: formData.get("notes") ?? "",
      photos: await readPhotos(formData),
    });

    revalidateAll();
    return { ok: true, id: job.id, message: `${job.id} marked done` };
  } catch (error) {
    return fail(error);
  }
}

export async function handBackAction(formData) {
  try {
    const technician = await signedIn();
    const job = await handBackRequest(formData.get("id"), technician.id, {
      reason: formData.get("reason"),
    });

    revalidateAll();
    return { ok: true, id: job.id, message: `${job.id} is back with the office` };
  } catch (error) {
    return fail(error);
  }
}

// --- Signing in -------------------------------------------------------------
// Phone → code → the worklist. Only numbers on the staff roster get in: the
// API refuses anyone else with a reason that is shown as it is.

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
    await verifyCode((formData.get("code") ?? "").toString());
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}
