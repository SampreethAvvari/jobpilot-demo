"use client";

/** One-paint placeholder while the store seeds on the client. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton h-8 w-2/3" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-10 w-full" style={{ opacity: 1 - i * 0.09 }} />
      ))}
    </div>
  );
}
