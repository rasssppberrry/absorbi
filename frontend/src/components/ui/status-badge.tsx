const labels: Record<string, string> = {
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  signed: "Signed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-[2px] border border-border px-2 py-0.5 text-xs text-muted">
      {labels[status] ?? status}
    </span>
  );
}
