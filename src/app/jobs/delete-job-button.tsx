"use client";

import { deleteJobAction } from "./actions";

export function DeleteJobButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteJobAction}
      onSubmit={(event) => {
        if (!confirm(`Delete "${title}"?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-zinc-500 hover:text-red-600"
        aria-label={`Delete ${title}`}
      >
        Delete
      </button>
    </form>
  );
}
