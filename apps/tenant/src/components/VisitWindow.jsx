"use client";

import { useState } from "react";
import Input from "@aqarly/ui/Input";
import Select from "@aqarly/ui/Select";
import { visitHours } from "@aqarly/core/labels";

const todayIso = () => new Date().toISOString().slice(0, 10);

const hourOptions = [
  { value: "", label: "Any time" },
  ...visitHours.map((hour) => ({ value: hour, label: hour })),
];

// What a day and a From–To pick amount to: the slot to post, whether it can
// be sent, and what to say if not. The API keeps day and window together, so
// a day needs its window and a window its day.
function readWindow({ date, from, to }, required) {
  const backwards = Boolean(from && to) && visitHours.indexOf(from) >= visitHours.indexOf(to);
  const slot = from && to && !backwards ? `${from}–${to}` : "";
  const complete = date ? Boolean(slot) : !from && !to && !required;
  const problem = complete
    ? null
    : backwards
      ? "“To” must be after “From”."
      : !date && (from || to)
        ? "Pick a day for that time window."
        : date
          ? "Pick a start and an end time for that day."
          : null;
  return { slot, complete, problem };
}

// When the tenant wants the visit: a day, and a From–To window on it, the
// same choice the admin portals offer (any span on the hour, "9AM–1PM"). It
// posts `scheduledDate` and `scheduledSlot`. `onChange` gets whether what's
// picked can be sent, so the form can hold its submit until it can.
export default function VisitWindow({ required = false, onChange }) {
  const [picked, setPicked] = useState({ date: "", from: "", to: "" });
  const { slot, problem } = readWindow(picked, required);

  function update(change) {
    const next = { ...picked, ...change };
    setPicked(next);
    onChange?.(readWindow(next, required).complete);
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        id="visit-date"
        name="scheduledDate"
        label={required ? "Date" : "Preferred date (optional)"}
        type="date"
        min={todayIso()}
        required={required}
        value={picked.date}
        onChange={(event) => update({ date: event.target.value })}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Select id="visit-from" label="From" options={hourOptions} onChange={(from) => update({ from })} />
        </div>
        <div className="flex-1">
          <Select id="visit-to" label="To" options={hourOptions} onChange={(to) => update({ to })} />
        </div>
      </div>
      <input type="hidden" name="scheduledSlot" value={slot} />
      {problem && <p className="text-xs text-danger">{problem}</p>}
    </div>
  );
}
