import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { CONCERNS, CONCERN_EN, FEE, HOUSE, TAGLINE, doors, isEn, recommend, SEER_MAP, type SeerId } from "@/lib/seers";
import { fee, useGame } from "@/lib/store";

export function House() {
  const nav = useNavigate();
  const birth = useGame((s) => s.birth);
  const setBirth = useGame((s) => s.setBirth);
  const paid = useGame((s) => s.paid);
  const markPaid = useGame((s) => s.markPaid);
  const start = useGame((s) => s.start);
  const fontLarge = useGame((s) => s.fontLarge);
  const toggleFont = useGame((s) => s.toggleFont);
  const [hydrated, setHydrated] = useState(() => useGame.persist.hasHydrated());
  const [needName, setNeedName] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const doorsRef = useRef<HTMLElement>(null);
  const en = isEn(birth.name);
  const named = Boolean(birth.name.trim());
  const rec = recommend(birth.concern);
  const recSeer = SEER_MAP[rec];
  const list = doors(birth.concern);
  const extraLarge = birth.year > 0 && birth.year <= 1955;

  useEffect(() => {
    if (useGame.persist.hasHydrated()) { setHydrated(true); return; }
    return useGame.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  useEffect(() => { if (named) setNeedName(false); }, [named]);
  useEffect(() => {
    if (birth.year > 0 && birth.year <= 1960 && !fontLarge) useGame.getState().toggleFont();
  }, [birth.year, fontLarge]);
  useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) { enter(rec); return; }
    const id = window.setTimeout(() => setCountdown((n) => (n == null ? null : n - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  function enter(id: SeerId) {
    if (!useGame.getState().paid) return;
    start(id);
    void nav("/session/" + id);
  }
  function handlePaid() {
    if (!named) { setNeedName(true); return; }
    markPaid();
    setCountdown(1);
    setToast(en ? ("Doors open · " + recSeer.name) : ("문이 열렸습니다 · " + recSeer.name));
    window.setTimeout(() => setToast(null), 2200);
    window.setTimeout(() => doorsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  const mainCls = "relative min-h-dvh bg-bg text-fg" + (extraLarge ? " session-xl" : fontLarge ? " session-large" : "");
  const padCls = "relative mx-auto max-w-2xl px-4 pt-14 sm:max-w-5xl sm:pt-20" + (paid || named ? " pb-40" : " pb-24");
  const fontBtn = "min-h-12 min-w-12 rounded-md border font-[family-name:var(--font-display)] " + (fontLarge || extraLarge ? "border-accent bg-accent text-accent-foreground" : "border-border bg-bg/70");
  const nameCls = "min-h-12 rounded-md border bg-elevated px-3 text-base text-fg " + (needName ? "door-pulse border-accent" : "border-border");
  const skipCls = "min-h-12 rounded-md border px-3 text-sm " + (birth.timeUnknown ? "border-accent bg-accent text-accent-foreground" : named ? "door-pulse border-accent bg-elevated" : "border-border bg-elevated");

  return (
    <main className={mainCls}>
      <div className="absolute inset-x-0 top-0 h-[36vh] bg-gradient-to-b from-[#2a1814] to-bg" />
      {toast ? <p className="fixed left-1/2 top-16 z-40 -translate-x-1/2 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">{toast}</p> : null}
      <div className={padCls}>
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.28em] text-muted">{en ? "₩50,000 · 20 minutes" : TAGLINE}</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">{HOUSE}</h1>
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-subtle">
              <span className="rounded-full border border-border px-2 py-0.5">{en ? "Staged" : "연출"}</span>
              {en ? "Not a real payment" : "실제 결제가 아닙니다"}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-fg/90">{en ? "Write your birth hour, place the offering, and five doors open." : "생시를 적고 복채를 올리면 다섯 문이 열립니다."}</p>
            <Link to="/archive" className="mt-3 inline-block min-h-10 py-2 text-xs text-muted underline-offset-4 hover:underline">{en ? "Past slips" : "지난 점사"}</Link>
          </div>
          <button type="button" className={fontBtn} onClick={toggleFont}>가</button>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
          <div>
            <section className="hanji rounded-xl p-5">
              <h2 className="font-[family-name:var(--font-display)] text-xl">{en ? "Birth hour" : "생시"}</h2>
              {!hydrated ? <p className="mt-3 text-sm text-muted">{en ? "Opening…" : "생시 장을 여는 중…"}</p> : (
                <div className="mt-3 grid gap-3">
                  <label className="grid gap-1 text-sm">{en ? "Name" : "이름"}
                    <input autoFocus className={nameCls} value={birth.name} placeholder={en ? "Your name" : "성함"} onChange={(e) => setBirth({ name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handlePaid(); } }} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["여성", "남성", "밝히지 않음"] as const).map((g) => (
                      <button key={g} type="button" className={"min-h-12 rounded-full border px-3 text-sm " + (birth.gender === g ? "border-accent bg-accent text-accent-foreground" : "border-border bg-elevated")} onClick={() => setBirth({ gender: g })}>
                        {en ? (g === "여성" ? "Woman" : g === "남성" ? "Man" : "Unsaid") : g}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["양력", "음력"] as const).map((c) => (
                      <button key={c} type="button" className={"min-h-12 rounded-full border px-3 text-sm " + (birth.calendar === c ? "border-accent bg-accent text-accent-foreground" : "border-border bg-elevated")} onClick={() => setBirth({ calendar: c })}>
                        {en ? (c === "양력" ? "Solar" : "Lunar") : c}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="grid gap-1 text-sm">{en ? "Year" : "년"}
                      <div className="flex items-center gap-1">
                        <button type="button" className="min-h-12 min-w-10 rounded-md border border-border bg-elevated text-xs" onClick={() => setBirth({ year: Math.max(1920, birth.year - 10) })}>−10</button>
                        <input type="number" className="min-h-12 min-w-0 flex-1 rounded-md border border-border bg-elevated px-1 text-center text-fg" value={birth.year} onChange={(e) => setBirth({ year: Number(e.target.value) })} />
                        <button type="button" className="min-h-12 min-w-10 rounded-md border border-border bg-elevated text-xs" onClick={() => setBirth({ year: Math.min(2024, birth.year + 10) })}>+10</button>
                      </div>
                    </label>
                    <label className="grid gap-1 text-sm">{en ? "Month" : "월"}
                      <input type="number" className="min-h-12 rounded-md border border-border bg-elevated px-2 text-center text-fg" value={birth.month} onChange={(e) => setBirth({ month: Number(e.target.value) })} />
                    </label>
                    <label className="grid gap-1 text-sm">{en ? "Day" : "일"}
                      <input type="number" className="min-h-12 rounded-md border border-border bg-elevated px-2 text-center text-fg" value={birth.day} onChange={(e) => setBirth({ day: Number(e.target.value) })} />
                    </label>
                  </div>
                  <button type="button" className={skipCls} onClick={() => setBirth({ timeUnknown: !birth.timeUnknown })}>
                    {en ? (birth.timeUnknown ? "Hour unknown · skip" : "Skip birth hour") : (birth.timeUnknown ? "시를 모름으로 두었습니다" : "시 모름으로 바로")}
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {CONCERNS.map((c) => (
                      <button key={c} type="button" className={"min-h-12 rounded-full border px-3 text-sm " + (birth.concern === c ? "border-accent bg-accent text-accent-foreground" : "border-border bg-elevated")} onClick={() => setBirth({ concern: c })}>
                        {en ? CONCERN_EN[c] : c}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: recSeer.color }} />
                    {en ? ("Recommended: " + recSeer.name + " · " + recSeer.wait) : ("이 고민에는 " + recSeer.name + " · " + recSeer.wait)}
                  </p>
                </div>
              )}
            </section>
            {named && !paid ? <button type="button" className="door-pulse mt-3 min-h-12 w-full rounded-md border border-border px-4" onClick={handlePaid}>{en ? "Place offering as-is" : "이대로 복채"}</button> : null}
            <section className="hanji mt-5 rounded-xl p-5">
              <p className="text-xs tracking-[0.22em] text-muted">{en ? "Offering" : "복채"}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums">{fee(FEE)}</p>
              <p className="mt-1 text-sm text-muted">{en ? "Twenty minutes. Staged offering — not a real payment." : "정식 자리 · 이십 분. 당 안의 연출이며 실제 결제가 아닙니다."}</p>
              {paid ? <p className="mt-4 text-sm">{en ? "Offering received." : "복채가 올랐습니다. 문을 고르세요."}</p> : (
                <>
                  <button type="button" className="mt-5 min-h-12 w-full rounded-md bg-accent text-base text-accent-foreground" onClick={handlePaid}>{en ? "Place offering" : "복채를 올리다"}</button>
                  {needName ? <p className="mt-2 text-center text-xs text-accent">{en ? "Write a name first." : "먼저 이름을 적어 주세요."}</p> : null}
                </>
              )}
            </section>
            {paid ? (
              <section className="mt-5">
                <button type="button" className="min-h-12 w-full rounded-md bg-accent text-base text-accent-foreground" onClick={() => { setCountdown(null); enter(rec); }}>{en ? ("Enter " + recSeer.name) : (recSeer.name + " 방으로")}</button>
                <p className="mt-2 text-center text-xs text-muted">{countdown != null && countdown > 0 ? (en ? ("Entering in " + countdown + "…") : (countdown + "초 뒤 들어갑니다.")) : recSeer.wait}</p>
              </section>
            ) : null}
          </div>
          <section ref={doorsRef} className="scroll-mt-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl">{en ? "Five doors" : "다섯 문"}</h2>
            <p className="mb-4 mt-1 text-sm text-muted">{paid ? (en ? (recSeer.name + " is the usual door.") : (birth.concern + " 손님은 " + recSeer.name + " 방이 많습니다.")) : (en ? "Place the offering first." : "먼저 복채를 올리세요.")}</p>
            <div className="grid gap-3">
              {list.map((seer) => {
                const recd = seer.id === rec;
                const doorCls = "flex min-h-32 overflow-hidden rounded-xl text-left " + (!paid ? "cursor-not-allowed opacity-55" : "") + (recd && paid ? " door-pulse ring-1 ring-accent/70" : "");
                return (
                  <button key={seer.id} type="button" disabled={!paid} onClick={() => { setCountdown(null); enter(seer.id); }} className={doorCls} style={{ background: "var(--color-surface)", boxShadow: "0 0 0 1px rgba(243,236,227,0.08)" }}>
                    <div className="w-24 shrink-0 sm:w-32" style={{ background: "linear-gradient(160deg, " + seer.color + ", #0c0a08)" }} />
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-[family-name:var(--font-display)] text-xl leading-none">{seer.name}</h3>
                          {recd ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{paid ? (en ? "Enter now" : "지금 들다") : (en ? "For this" : "이 고민에")}</span> : null}
                        </div>
                        <p className="mt-1 text-xs text-muted">{seer.title} · {seer.room}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-fg/85">{seer.rumor}</p>
                      <p className="mt-2 text-xs text-subtle">{seer.wait}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        {paid ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button type="button" className="min-h-12 w-full rounded-md bg-accent text-accent-foreground" style={{ boxShadow: "0 0 0 2px " + recSeer.color + "88" }} onClick={() => { setCountdown(null); enter(rec); }}>
              {countdown != null && countdown > 0 ? (en ? ("Enter " + recSeer.name + " · " + countdown) : (recSeer.name + " 방으로 · " + countdown)) : (en ? ("Enter " + recSeer.name) : (recSeer.name + " 방으로"))}
            </button>
          </div>
        ) : named ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button type="button" className="door-pulse min-h-12 w-full rounded-md bg-accent text-accent-foreground" onClick={handlePaid}>
              {en ? ("Place offering · " + fee(FEE)) : ("이대로 복채 · " + fee(FEE))}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}