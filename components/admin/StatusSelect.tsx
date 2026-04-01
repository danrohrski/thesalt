"use client";

import { useRef } from "react";

interface StatusSelectProps {
  slug: string;
  published: boolean;
  action: (formData: FormData) => Promise<void>;
}

export function StatusSelect({ slug, published, action }: StatusSelectProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="slug" value={slug} />
      <div className="relative inline-flex items-center">
        <select
          name="published"
          defaultValue={String(published)}
          onChange={() => formRef.current?.requestSubmit()}
          className="appearance-none font-[family-name:var(--font-display)] cursor-pointer pr-6 pl-3 py-1 transition-opacity hover:opacity-75"
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: `1px solid ${published ? "rgba(74,124,89,0.35)" : "rgba(35,33,32,0.2)"}`,
            color: published ? "#4a7c59" : "rgba(35,33,32,0.45)",
            background: published ? "rgba(74,124,89,0.06)" : "transparent",
            outline: "none",
          }}
        >
          <option value="true">Live</option>
          <option value="false">Draft</option>
        </select>
        {/* Chevron */}
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute right-2"
          style={{ color: published ? "#4a7c59" : "rgba(35,33,32,0.4)" }}
        >
          <path
            d="M1.5 3L4.5 6L7.5 3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </form>
  );
}
