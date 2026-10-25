import type { ArchKey, BudgetLevel, ColorKey, ComplexityLevel, Preferences } from "../types";
import { ARCHES, ARCH_META, COLORS, COLOR_META, hasActivePreferences } from "../lib/scoring";
import { ManaPip } from "./ui";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function PreferencesPanel({
  preferences,
  onChange,
  defaultOpen = false,
  compact = false,
}: {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  defaultOpen?: boolean;
  compact?: boolean;
}) {
  const active =
    preferences.mustHaveArches.length +
    preferences.avoidArches.length +
    preferences.mustHaveColors.length +
    preferences.avoidColors.length +
    (preferences.maxBudget ? 1 : 0) +
    (preferences.maxComplexity ? 1 : 0);

  const update = (partial: Partial<Preferences>) =>
    onChange({ ...preferences, ...partial });

  const toggleRequiredArch = (arch: ArchKey) =>
    update({
      mustHaveArches: toggle(preferences.mustHaveArches, arch),
      avoidArches: preferences.avoidArches.filter((item) => item !== arch),
    });

  const toggleAvoidedArch = (arch: ArchKey) =>
    update({
      avoidArches: toggle(preferences.avoidArches, arch),
      mustHaveArches: preferences.mustHaveArches.filter((item) => item !== arch),
    });

  const toggleRequiredColor = (color: ColorKey) =>
    update({
      mustHaveColors: toggle(preferences.mustHaveColors, color),
      avoidColors: preferences.avoidColors.filter((item) => item !== color),
    });

  const toggleAvoidedColor = (color: ColorKey) =>
    update({
      avoidColors: toggle(preferences.avoidColors, color),
      mustHaveColors: preferences.mustHaveColors.filter((item) => item !== color),
    });

  return (
    <details
      open={defaultOpen}
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-serif text-lg text-amber-50">
            Must-haves & dealbreakers
          </span>
          <span className="mt-0.5 block text-xs text-amber-100/50">
            Tell the Oracle what a result absolutely must include or avoid.
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {active > 0 && (
            <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2.5 py-1 text-[11px] text-amber-100">
              {active} active
            </span>
          )}
          <span className="text-amber-200/60">⌄</span>
        </span>
      </summary>

      <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
        <section>
          <h3 className="text-sm font-semibold text-amber-50">
            Must include these strategies
          </h3>
          <p className="mt-0.5 text-xs text-amber-100/45">
            Select one or more; commanders without them lose fit.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ARCHES.map((arch) => {
              const selected = preferences.mustHaveArches.includes(arch);
              return (
                <button
                  key={arch}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleRequiredArch(arch)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    selected
                      ? "border-amber-200/60 bg-amber-200/20 text-amber-50"
                      : "border-white/10 bg-white/5 text-amber-100/60 hover:border-white/25 hover:text-amber-100"
                  }`}
                >
                  {ARCH_META[arch].emoji} {ARCH_META[arch].name.replace("The ", "")}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-amber-50">
            Dealbreaker strategies
          </h3>
          <p className="mt-0.5 text-xs text-amber-100/45">
            Hate stax? Never want combo? These get pushed down hard.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ARCHES.map((arch) => {
              const selected = preferences.avoidArches.includes(arch);
              return (
                <button
                  key={arch}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAvoidedArch(arch)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    selected
                      ? "border-rose-300/50 bg-rose-300/15 text-rose-100"
                      : "border-white/10 bg-white/5 text-amber-100/60 hover:border-white/25 hover:text-amber-100"
                  }`}
                >
                  ✕ {ARCH_META[arch].name.replace("The ", "")}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold text-amber-50">
              Required colors
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COLORS.map((color) => {
                const selected = preferences.mustHaveColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? "Remove" : "Require"} ${COLOR_META[color].name}`}
                    onClick={() => toggleRequiredColor(color)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition ${
                      selected
                        ? "border-amber-200/60 bg-amber-200/15 text-amber-50"
                        : "border-white/10 bg-white/5 text-amber-100/60 hover:border-white/25"
                    }`}
                  >
                    <ManaPip color={color} size={20} />
                    {COLOR_META[color].name}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-amber-50">
              Avoid these colors
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COLORS.map((color) => {
                const selected = preferences.avoidColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? "Allow" : "Avoid"} ${COLOR_META[color].name}`}
                    onClick={() => toggleAvoidedColor(color)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition ${
                      selected
                        ? "border-rose-300/50 bg-rose-300/15 text-rose-100"
                        : "border-white/10 bg-white/5 text-amber-100/60 hover:border-white/25"
                    }`}
                  >
                    <ManaPip color={color} size={20} />
                    ✕ {COLOR_META[color].name}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Maximum budget
            <select
              value={preferences.maxBudget ?? ""}
              onChange={(event) =>
                update({
                  maxBudget: event.target.value
                    ? (Number(event.target.value) as BudgetLevel)
                    : undefined,
                })
              }
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#16131c] px-3 py-2 text-sm normal-case tracking-normal text-amber-50 outline-none transition focus:border-amber-200/50"
            >
              <option value="">No limit</option>
              <option value="1">$ — budget builds</option>
              <option value="2">$$ — midrange</option>
              <option value="3">$$$ — no restriction</option>
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-[0.16em] text-amber-100/55">
            Maximum complexity
            <select
              value={preferences.maxComplexity ?? ""}
              onChange={(event) =>
                update({
                  maxComplexity: event.target.value
                    ? (Number(event.target.value) as ComplexityLevel)
                    : undefined,
                })
              }
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#16131c] px-3 py-2 text-sm normal-case tracking-normal text-amber-50 outline-none transition focus:border-amber-200/50"
            >
              <option value="">Any complexity</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level} / 5 or simpler
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="max-w-xl text-[11px] leading-relaxed text-amber-100/45">
            Dealbreakers apply a transparent score penalty rather than deleting
            commanders, so you can still inspect why something was rejected.
            {hasActivePreferences(preferences) &&
              " Preference changes also update your shareable link."}
          </p>
          {active > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  mustHaveArches: [],
                  avoidArches: [],
                  mustHaveColors: [],
                  avoidColors: [],
                  maxBudget: undefined,
                  maxComplexity: undefined,
                })
              }
              className="text-xs text-amber-100/55 underline underline-offset-4 transition hover:text-amber-100"
            >
              Reset preferences
            </button>
          )}
        </div>
      </div>
    </details>
  );
}
