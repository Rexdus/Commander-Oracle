import type { CatalogMeta, CatalogStatus } from "../types";

const STATUS_LABEL: Record<CatalogStatus, string> = {
  seed: "Curated seed",
  cached: "Cached live data",
  loading: "Refreshing…",
  live: "Live data",
  error: "Refresh failed",
};

const STATUS_STYLE: Record<CatalogStatus, string> = {
  seed: "border-white/15 bg-white/5 text-amber-100/65",
  cached: "border-sky-200/25 bg-sky-200/10 text-sky-100/85",
  loading: "border-amber-200/30 bg-amber-200/10 text-amber-100",
  live: "border-emerald-200/30 bg-emerald-200/10 text-emerald-100",
  error: "border-rose-300/30 bg-rose-300/10 text-rose-100",
};

export default function CatalogStatusBadge({
  meta,
  status,
  error,
  onRefresh,
  compact = false,
}: {
  meta: CatalogMeta;
  status: CatalogStatus;
  error?: string | null;
  onRefresh: () => void;
  compact?: boolean;
}) {
  const date = new Date(meta.popularityDate);
  const formattedDate = Number.isNaN(date.getTime())
    ? meta.popularityDate
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
            <span className="font-semibold text-amber-50">
              {meta.total} commanders
            </span>
            <span className="text-amber-100/45">·</span>
            <span className="text-amber-100/60">
              popularity snapshot {formattedDate}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-100/50">
            {meta.window}. {meta.curated} curated · {meta.generated} inferred
            from Scryfall card text. Generated strategy, budget and bracket
            labels are estimates.
          </p>
          {error && (
            <p className="mt-1 text-xs text-rose-200/75">
              {error} Showing the last available catalog.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={status === "loading"}
          className="shrink-0 rounded-full border border-amber-200/30 bg-amber-200/10 px-3.5 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-200/20 disabled:cursor-wait disabled:opacity-50"
        >
          {status === "loading" ? "Refreshing…" : "Refresh data"}
        </button>
      </div>
    </div>
  );
}
