"use server";

import { revalidatePath } from "next/cache";
import {
  addHousekeepingRate,
  addStaff,
  assignRequests,
  createRequest,
  deleteRequests,
  maxRequestPhotos,
  removeHousekeepingRate,
  removeStaff,
  resetOperationsData,
  updateStaff,
} from "@aqarly/core/operations";

// Every housekeeping write goes through here. The mutation itself belongs to
// `packages/core`; this layer only translates form data and tells Next what
// to re-render, so swapping the store for a database touches neither.

// Housekeeping routes are all `force-dynamic`, but the router cache still holds
// rendered segments, so a write has to invalidate the whole tree.
function revalidateAll() {
  revalidatePath("/", "layout");
}

function fail(error) {
  return { ok: false, error: error.message ?? "Something went wrong" };
}

// There is no file store yet, so an uploaded file is inlined as a data URL
// and kept with the record it belongs to. That only stays reasonable while
// files are small — a photo or a PDF comfortably is; video only barely is,
// which is why it gets its own, much tighter cap, and why raising either
// further has to wait for somewhere real for these to live.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_KIND = { test: (type) => type.startsWith("image/"), max: MAX_IMAGE_BYTES };

const ACCEPTED_KINDS = [
  IMAGE_KIND,
  { test: (type) => type === "application/pdf", max: MAX_IMAGE_BYTES },
  { test: (type) => type.startsWith("video/"), max: MAX_VIDEO_BYTES },
];

// A phone's "regular" camera recording is H.264/AAC in a QuickTime
// container — decodable by every browser's mp4 support, just labelled
// video/quicktime. Browsers only check the label, not the bytes, and won't
// play that label at all, so it's relabelled to the mp4 they'd otherwise
// have accepted without complaint. A clip actually encoded as HEVC still
// won't decode; the viewer's own fallback catches that case.
function playableType(type) {
  return type === "video/quicktime" ? "video/mp4" : type;
}

function uploadedFiles(formData, name) {
  return formData
    .getAll(name)
    .filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);
}

async function inlineFile(file, kinds, expected) {
  const kind = kinds.find((k) => k.test(file.type));
  if (!kind) {
    throw new Error(`${file.name} isn't ${expected}`);
  }
  if (file.size > kind.max) {
    throw new Error(
      `${file.name} is larger than ${Math.round(kind.max / (1024 * 1024))} MB`,
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${playableType(file.type)};base64,${base64}`;
}

async function readPhotos(formData) {
  const files = uploadedFiles(formData, "photos");

  if (files.length > maxRequestPhotos) {
    throw new Error(`Up to ${maxRequestPhotos} attachments per booking`);
  }

  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      dataUrl: await inlineFile(file, ACCEPTED_KINDS, "a photo, PDF, or video"),
    })),
  );
}

async function readStaffPhoto(formData) {
  const [file] = uploadedFiles(formData, "photo");
  return file ? inlineFile(file, [IMAGE_KIND], "an image") : null;
}

export async function createRequestAction(formData) {
  try {
    const request = await createRequest({
      unitId: formData.get("unitId"),
      category: formData.get("category"),
      summary: formData.get("summary"),
      description: formData.get("description") ?? "",
      photos: await readPhotos(formData),
      assigneeId: formData.get("assigneeId") || null,
      scheduledDate: formData.get("scheduledDate") || null,
      scheduledSlot: formData.get("scheduledSlot") || null,
    });

    revalidateAll();
    return { ok: true, id: request.id, message: `${request.id} created` };
  } catch (error) {
    return fail(error);
  }
}

export async function assignAction(formData) {
  try {
    const ids = formData.getAll("id").filter(Boolean);
    const assigneeId = formData.get("assigneeId");
    const touched = await assignRequests(ids, assigneeId);

    if (touched.length === 0) {
      return { ok: false, error: "Nothing left to assign — that work is done" };
    }

    revalidateAll();
    return {
      ok: true,
      message: `${touched.length} ${touched.length === 1 ? "booking" : "bookings"} assigned`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteRequestsAction(formData) {
  try {
    const ids = formData.getAll("id").filter(Boolean);
    const removed = await deleteRequests(ids);

    if (removed.length === 0) {
      return { ok: false, error: "Nothing left to remove" };
    }

    revalidateAll();
    return {
      ok: true,
      message: `${removed.length} ${removed.length === 1 ? "booking" : "bookings"} removed`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function addRateAction(formData) {
  try {
    const rate = await addHousekeepingRate({
      label: formData.get("label"),
      price: formData.get("price"),
    });

    revalidateAll();
    return { ok: true, message: `${rate.label} added to the rate card` };
  } catch (error) {
    return fail(error);
  }
}

export async function removeRateAction(formData) {
  try {
    const rate = await removeHousekeepingRate(formData.get("serviceType"));

    revalidateAll();
    return { ok: true, message: `${rate.label} removed from the rate card` };
  } catch (error) {
    return fail(error);
  }
}

export async function addStaffAction(formData) {
  try {
    const member = await addStaff({
      name: formData.get("name"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      photo: await readStaffPhoto(formData),
    });

    revalidateAll();
    return { ok: true, message: `${member.name} added to the roster` };
  } catch (error) {
    return fail(error);
  }
}

export async function updateStaffAction(formData) {
  try {
    const member = await updateStaff(formData.get("id"), {
      name: formData.get("name"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      photo: await readStaffPhoto(formData),
    });

    revalidateAll();
    return { ok: true, message: `${member.name} updated` };
  } catch (error) {
    return fail(error);
  }
}

export async function removeStaffAction(formData) {
  try {
    const member = await removeStaff(formData.get("id"));

    revalidateAll();
    return { ok: true, message: `${member.name} removed from the roster` };
  } catch (error) {
    return fail(error);
  }
}

export async function resetAction() {
  await resetOperationsData();
  revalidateAll();
}
