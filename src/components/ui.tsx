import type { ColorKey } from "../types";
import { COLOR_META } from "../lib/scoring";

const PIP_GLYPH: Record<ColorKey, string> = {
  W: "☀",
  U: "💧",
  B: "☠",
  R: "🔥",
  G: "🌳",
};

export function ManaPip({
  color,
  size = 28,
  dim = false,
}: {
  color: ColorKey;
  size?: number;
  dim?: boolean;
}) {
  const meta = COLOR_META[color];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35)] ring-1 ring-black/40"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, #fff8, ${meta.hex})`,
        color: meta.text,
        fontSize: size * 0.5,
        opacity: dim ? 0.25 : 1,
      }}
      title={meta.name}
    >
      {size >= 22 ? PIP_GLYPH[color] : ""}
    </span>
  );
}

export function PipRow({
  colors,
  size = 26,
}: {
  colors: ColorKey[];
  size?: number;
}) {
  if (colors.length === 0) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-bold shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35)] ring-1 ring-black/40"
        style={{
          width: size,
          height: size,
          background: "radial-gradient(circle at 32% 28%, #fff8, #cfc9c2)",
          color: "#2b2822",
          fontSize: size * 0.5,
        }}
        title="Colorless"
      >
        {size >= 22 ? "◇" : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex gap-1">
      {colors.map((c) => (
        <ManaPip key={c} color={c} size={size} />
      ))}
    </span>
  );
}

export function Bar({
  label,
  pct,
  color,
  caption,
}: {
  label: string;
  pct: number;
  color: string;
  caption?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium tracking-wide text-amber-100/90">
          {label}
        </span>
        <span className="tabular-nums text-amber-100/50">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.max(2, pct)}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
          }}
        />
      </div>
      {caption && <p className="text-[11px] text-amber-100/40">{caption}</p>}
    </div>
  );
}

export function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0a10]">
      <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-indigo-700/20 blur-[120px]" />
      <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-rose-700/15 blur-[120px]" />
      <div className="absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-emerald-700/15 blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
