import { useState } from "react";
import type { ScoredCommander } from "../types";
import type { Profile } from "../lib/scoring";
import {
  ARCHES,
  ARCH_META,
  COLORS,
  COLOR_META,
  FRANCHISE_META,
  artUrl,
  edhrecPage,
  guildName,
  scryfallPage,
} from "../lib/scoring";
import { Bar, ManaPip, PipRow } from "./ui";

function CardArt({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/50 to-slate-900 text-5xl">
        ✦
      </div>
    );
  }
  return (
    <img
      src={artUrl(name, "art_crop")}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-200/10 bg-black/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-amber-100/40">
        {label}
      </div>
      <div className="text-sm font-medium text-amber-50">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-2.5 py-0.5 text-[11px] text-amber-100/85">
      {children}
    </span>
  );
}

export default function Result({
  ranked,
  profile,
  answeredCount,
  totalCount,
  onRestart,
}: {
  ranked: ScoredCommander[];
  profile: Profile;
  answeredCount: number;
  totalCount: number;
  onRestart: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const top = ranked[0];
  const alts = ranked.slice(1, 4);
  const more = ranked.slice(4, 10);
  const cmd = top.commander;

  const identity = profile.topColors.filter((c) => profile.colors[c] > 0);
  const primary = profile.topColors[0];
  const archA = profile.topArch[0];
  const archB = profile.topArch[1];

  const share = () => {
    const text = `My Magic commander is ${cmd.name} (${guildName(
      cmd.colors,
    )}) — ${top.match}% match. ${ARCH_META[archA].name} / ${
      ARCH_META[archB].name
    }. Find yours in the Commander Oracle.`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      },
      () => undefined,
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-20 pt-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/50">
          The oracle has spoken
        </p>
        <h1 className="mt-2 font-serif text-3xl text-amber-50 sm:text-4xl">
          You should play
        </h1>
        <p className="mt-2 text-xs text-amber-100/40">
          Read from {answeredCount} of {totalCount} answers, matched against the
          100 most-built commanders on EDHREC.
        </p>
      </div>

      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-2xl shadow-black/60 backdrop-blur">
        <div className="relative h-56 w-full sm:h-72">
          <CardArt name={cmd.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b12] via-[#0d0b12]/30 to-transparent" />
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
            <span className="rounded-full border border-amber-200/30 bg-black/60 px-3 py-1 text-xs font-semibold tracking-wide text-amber-100 backdrop-blur">
              {top.match}% match
            </span>
            <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[10px] text-amber-100/70 backdrop-blur">
              EDHREC #{cmd.rank}
            </span>
          </div>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="mb-2 flex items-center gap-2">
              <PipRow colors={cmd.colors} size={24} />
              <span className="text-xs uppercase tracking-[0.2em] text-amber-100/70">
                {guildName(cmd.colors)}
              </span>
            </div>
            <h2 className="font-serif text-3xl leading-tight text-white drop-shadow sm:text-4xl">
              {cmd.name}
            </h2>
            <p className="mt-1 text-sm italic text-amber-100/80">
              {cmd.tagline}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {top.reasons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {top.reasons.map((r) => (
                <Chip key={r}>✓ {r}</Chip>
              ))}
            </div>
          )}

          <p className="text-[15px] leading-relaxed text-amber-50/85">
            {cmd.blurb}
          </p>

          <div className="rounded-xl border border-amber-200/15 bg-amber-100/[0.04] p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60">
              Why you
            </div>
            <p className="mt-1 text-sm leading-relaxed text-amber-50/90">
              {cmd.youAre}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Game plan" value={cmd.plan} />
            <Stat
              label="Complexity"
              value={"●".repeat(cmd.difficulty) + "○".repeat(5 - cmd.difficulty)}
            />
            <Stat label="Budget" value={cmd.budget} />
            <Stat label="Deck themes" value={cmd.tags.join(" · ")} />
          </div>

          <div className="flex flex-wrap gap-2">
            {cmd.media.map((m) => (
              <span
                key={m}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-amber-100/70"
              >
                if you like {m}
              </span>
            ))}
            {cmd.franchise && cmd.franchise !== "mtg" && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-amber-100/70">
                🎬 {FRANCHISE_META[cmd.franchise]} crossover
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={scryfallPage(cmd.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-200/20"
            >
              See the card ↗
            </a>
            <a
              href={edhrecPage(cmd.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              Browse decklists ↗
            </a>
            <button
              onClick={share}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100/80 transition hover:bg-white/10"
            >
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>
      </div>

      {/* Profile breakdown */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <h3 className="font-serif text-xl text-amber-50">
            Your color identity
          </h3>
          <p className="mt-1 text-xs text-amber-100/50">
            Magic sorts personalities into five colors. Here's your mix.
          </p>
          <div className="mt-4 space-y-3">
            {COLORS.map((c) => (
              <div key={c} className="flex items-center gap-3">
                <ManaPip color={c} size={26} dim={profile.colorPct[c] < 8} />
                <div className="flex-1">
                  <Bar
                    label={COLOR_META[c].name}
                    pct={profile.colorPct[c]}
                    color={COLOR_META[c].hex}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <PipRow
                colors={identity.slice(0, Math.max(1, cmd.colors.length))}
                size={18}
              />
              <span>Leaning {COLOR_META[primary].name}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/60">
              {COLOR_META[primary].vibe}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <h3 className="font-serif text-xl text-amber-50">Your playstyle</h3>
          <p className="mt-1 text-xs text-amber-100/50">
            Scored across {ARCHES.length} deck archetypes. Your strongest six:
          </p>
          <div className="mt-4 space-y-3">
            {ARCHES.slice()
              .sort((a, b) => profile.arch[b] - profile.arch[a])
              .slice(0, 6)
              .map((a) => (
                <Bar
                  key={a}
                  label={`${ARCH_META[a].emoji} ${ARCH_META[a].name}`}
                  pct={profile.archPct[a]}
                  color="#e8c07d"
                />
              ))}
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="text-sm font-semibold text-amber-100">
              {ARCH_META[archA].name} · {ARCH_META[archB].name}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/60">
              {ARCH_META[archA].desc}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>
              rules appetite {"●".repeat(Math.round(profile.complexity))}
            </Chip>
            <Chip>budget {"$".repeat(profile.budget)}</Chip>
            {profile.franchise && (
              <Chip>{FRANCHISE_META[profile.franchise]}</Chip>
            )}
          </div>
        </div>
      </div>

      {/* Runner ups */}
      <div>
        <h3 className="mb-3 font-serif text-xl text-amber-50">
          Also strong matches
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {alts.map(({ commander: c, match, reasons }) => (
            <div
              key={c.name}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur transition hover:border-amber-200/30"
            >
              <div className="relative h-28">
                <CardArt name={c.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b12] to-transparent" />
                <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-amber-100">
                  {match}%
                </span>
              </div>
              <div className="space-y-1.5 p-3">
                <PipRow colors={c.colors} size={16} />
                <div className="font-serif text-base leading-tight text-amber-50">
                  {c.name}
                </div>
                <p className="text-xs italic text-amber-100/60">{c.tagline}</p>
                <p className="pt-0.5 text-[11px] text-amber-200/50">
                  {reasons.slice(0, 2).join(" · ")}
                </p>
                <a
                  href={scryfallPage(c.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block pt-1 text-[11px] text-amber-200/70 underline underline-offset-2 hover:text-amber-200"
                >
                  view card ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deeper list */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
        <button
          onClick={() => setShowAll((s) => !s)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-serif text-lg text-amber-50">
            Your full top 10
          </span>
          <span className="text-sm text-amber-100/60">
            {showAll ? "hide ▲" : "show ▼"}
          </span>
        </button>
        {showAll && (
          <ul className="mt-4 divide-y divide-white/5">
            {[top, ...alts, ...more].map((s, i) => (
              <li
                key={s.commander.name}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-amber-100/35">
                  {i + 1}
                </span>
                <PipRow colors={s.commander.colors} size={15} />
                <a
                  href={edhrecPage(s.commander.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate text-sm text-amber-50/90 hover:text-amber-200"
                >
                  {s.commander.name}
                </a>
                <span className="hidden shrink-0 text-[11px] text-amber-100/40 sm:block">
                  {s.commander.tags[0]}
                </span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-amber-200/70">
                  {s.match}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={onRestart}
          className="rounded-full border border-amber-200/30 bg-amber-200/10 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/20"
        >
          ↺ Take the quiz again
        </button>
      </div>

      <p className="pt-4 text-center text-[11px] leading-relaxed text-amber-100/30">
        Commander popularity data from EDHREC; card art via Scryfall. Magic: The
        Gathering is a trademark of Wizards of the Coast. Unofficial fan tool.
      </p>
    </div>
  );
}
