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
  setPriority,
  updateStaff,
} from "@aqarly/core/operations";

// Every ops write goes through here. The mutation itself belongs to
// `packages/core`; this layer only translates form data and tells Next what
// to re-render, so swapping the store for a database touches neither.

// Ops routes are all `force-dynamic`, but the router cache still holds
// rendered segments, so a write has to invalidate the whole tree.
function revalidateAll() {
  revalidatePath("/", "layout");
}

function fail(error) {
  return { ok: false, error: error.message ?? "Something went wrong" };
}

// There is no file store yet, so an uploaded photo is inlined as a data URL
// and kept with the request. That only stays reasonable while the files are
// small, which is what the cap is for.
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

async function readPhotos(formData) {
  const files = formData
    .getAll("photos")
    .filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);

  if (files.length > maxRequestPhotos) {
    throw new Error(`Up to ${maxRequestPhotos} photos per request`);
  }

  return Promise.all(
    files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        throw new Error(`${file.name} is not an image`);
      }
      if (file.size > MAX_PHOTO_BYTES) {
        throw new Error(`${file.name} is larger than 2 MB`);
      }

      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      return { name: file.name, dataUrl: `data:${file.type};base64,${base64}` };
    }),
  );
}

export async function createRequestAction(formData) {
  try {
    const request = await createRequest({
      unitId: formData.get("unitId"),
      category: formData.get("category"),
      priority: formData.get("priority") || "normal",
      summary: formData.get("summary"),
      description: formData.get("description") ?? "",
      photos: await readPhotos(formData),
      assigneeId: formData.get("assigneeId") || null,
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
      message: `${touched.length} ${touched.length === 1 ? "request" : "requests"} assigned`,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function setPriorityAction(formData) {
  try {
    const ids = formData.getAll("id").filter(Boolean);
    const touched = await setPriority(ids, formData.get("priority"));

    revalidateAll();
    return {
      ok: true,
      message: `Priority changed on ${touched.length} ${
        touched.length === 1 ? "request" : "requests"
      }`,
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
      message: `${removed.length} ${removed.length === 1 ? "request" : "requests"} removed`,
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
      role: formData.get("role"),
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
      role: formData.get("role"),
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
