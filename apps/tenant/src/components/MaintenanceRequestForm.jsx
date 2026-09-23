"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Alert from "@aqarly/ui/Alert";
import Button from "@aqarly/ui/Button";
import Select from "@aqarly/ui/Select";
import { createMaintenanceRequestAction } from "@/app/actions";
import Field from "@/components/Field";
import PhotoPicker from "@/components/PhotoPicker";
import Textarea from "@/components/Textarea";

export default function MaintenanceRequestForm({ categoryOptions }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = Boolean(category) && description.trim().length > 0;

  function submit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await createMaintenanceRequestAction(formData);
      if (result.ok) {
        router.push(`/requests/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      action={submit}
      className="flex flex-1 flex-col gap-6 md:mx-auto md:w-full md:max-w-lg"
    >
      {error && (
        <Alert tone="error" title="Couldn't submit that">
          {error}
        </Alert>
      )}

      <Select
        id="maintenance-category"
        name="category"
        label="Category"
        placeholder="Choose category"
        options={categoryOptions}
        onChange={setCategory}
      />

      <Field
        label="Describe the issue"
        htmlFor="maintenance-description"
        hint="Tip: include where the issue is and when it started"
      >
        <Textarea
          id="maintenance-description"
          name="description"
          placeholder="What's the problem? Be as specific as you can..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <Field label="Add photos (optional)">
        <PhotoPicker />
      </Field>

      <div className="mt-auto pt-2">
        <Button type="submit" size="lg" disabled={pending || !canSubmit} fullWidth>
          {pending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
