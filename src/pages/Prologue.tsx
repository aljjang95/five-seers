import { Link } from "react-router-dom";
import { useMemo } from "react";
import { HOUSE, SEERS, TAGLINE } from "@/lib/seers";
export function Prologue() {
  const en = useMemo(() => typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en"), []);
  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/40" />
      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at 50% 20%, #b54a3c55, transparent 55%)" }} />
      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-5 pb-28 pt-16 sm:px-10">
        <p className="text-xs tracking-[0.28em] text-muted">{en ? "Seoul · night door" : "서울 · 밤의 문"}</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none sm:text-7xl">{HOUSE}</h1>
        <p className="mt-4 max-w-md text-sm text-muted">{en ? "₩50,000 · twenty minutes" : TAGLINE}</p>
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-subtle">
          <span className="rounded-full border border-border px-2 py-0.5">{en ? "Staged reading" : "연출 점사"}</span>
          {en ? "Not medical or financial advice" : "의료·재테크 자문이 아닙니다"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SEERS.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 text-[10px] text-subtle">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-fg/85">
          {en ? "A lantern at the end of the alley. Five seers. Twenty minutes."
            : "골목 끝의 등. 다섯 보살. 사주를 열고 이십 분을 나눕니다."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/house" className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-accent-foreground">{en ? "Enter now" : "바로 들다"}</Link>
          <Link to="/house" className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-hanji px-6 text-ink">{en ? "Knock softly" : "문을 두드리다"}</Link>
        </div>
      </div>
    </main>
  );
}
