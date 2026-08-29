"use server";

import { revalidatePath } from "next/cache";
import {
  addHousekeepingRate,
  assignRequests,
  createRequest,
  resetOperationsData,
  setPriority,
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

export async function createRequestAction(formData) {
  try {
    const request = await createRequest({
      unitId: formData.get("unitId"),
      category: formData.get("category"),
      priority: formData.get("priority") || "normal",
      summary: formData.get("summary"),
      description: formData.get("description") ?? "",
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

export async function resetAction() {
  await resetOperationsData();
  revalidateAll();
}
