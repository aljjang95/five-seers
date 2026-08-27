import { useNavigate, useParams } from "react-router-dom";
import { Mic, Send, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CONCERN_EN, isEn, SEER_MAP, SESSION_MS, type Concern, type SeerId } from "@/lib/seers";
import { fmt, remain, useGame } from "@/lib/store";

const CUES: Record<Concern, string[]> = {
  전체운: ["올해 흐름이 궁금합니다", "지금 제가 놓친 게 있나요", "올해 조심할 달은요"],
  "연애·인연": ["이 인연이 맞나요", "상대가 저를 어떻게 보나요", "올해 만날까요"],
  "재물·사업": ["돈이 묶인 자리가 있나요", "올해 손대면 안 되는 달이요", "사업 타이밍이 궁금합니다"],
  "직장·진로": ["이 자리가 맞나요", "이직 시기를 보고 싶습니다", "상사와의 운이 궁금합니다"],
  "가족·건강": ["집안에 숨은 일이 있나요", "부모 운이 궁금합니다", "몸이 약한 자리가 있나요"],
  "이직·결단": ["지금 끊어야 하나요", "남으면 어떻게 되나요", "결단의 때를 찍어 주세요"],
};
const EN_CUES: Record<Concern, string[]> = {
  전체운: ["How does this year sit", "What am I missing", "Which month should I watch"],
  "연애·인연": ["Is this the right bond", "How do they see me", "Will I meet someone this year"],
  "재물·사업": ["Where is money stuck", "Which month must I not move", "When do I act on business"],
  "직장·진로": ["Is this the right seat", "When should I change jobs", "How is luck with my boss"],
  "가족·건강": ["Is there a hidden family matter", "How is my parents' luck", "Where is the body weak"],
  "이직·결단": ["Should I cut this now", "What if I stay", "Name the time to decide"],
};
function particle(name: string) {
  const ch = name.trim().slice(-1);
  if (!ch) return "이";
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "이";
  return (code - 0xac00) % 28 === 0 ? "가" : "이";
}
function localReply(seerName: string, chart: { dayMaster: string; animal: string; summary: string }, concern: Concern, guest: string, en: boolean) {
  if (en) return chart.dayMaster + " day-master, " + chart.animal + " year. On " + concern + ": a quiet turn this season.";
  return seerName + particle(seerName) + " 손님의 " + chart.dayMaster + "일간 " + chart.animal + "띠를 읽습니다. " + chart.summary + " “" + guest.slice(0, 40) + "” — 서두르지 않는 편이 낫습니다.";
}

export function Session() {
  const { seerId = "wolha" } = useParams();
  const id = seerId as SeerId;
  const seer = SEER_MAP[id];
  const nav = useNavigate();
  const active = useGame((s) => s.active);
  const push = useGame((s) => s.push);
  const close = useGame((s) => s.close);
  const fontLarge = useGame((s) => s.fontLarge);
  const toggleFont = useGame((s) => s.toggleFont);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [mute, setMute] = useState(false);
  const [listening, setListening] = useState(false);
  const [drawOpen, setDrawOpen] = useState(true);
  const [pip, setPip] = useState(true);
  const [foldArmed, setFoldArmed] = useState(false);
  const [warn10, setWarn10] = useState(false);
  const [warn5, setWarn5] = useState(false);
  const [warn3, setWarn3] = useState(false);
  const [warn1, setWarn1] = useState(false);
  const [left, setLeft] = useState(() => (active ? remain(active.endsAt) : 0));
  const [queue, setQueue] = useState<string[]>([]);
  const opening = useRef(false);
  const draftRef = useRef("");
  const logRef = useRef<HTMLDivElement>(null);
  const sessionOk = Boolean(active && !active.closed && active.seerId === id);

  useEffect(() => {
    if (!sessionOk || !active || opening.current || active.messages.length) return;
    opening.current = true;
    const en = isEn(active.birth.name);
    push({ role: "system", text: en ? ("Seated in " + seer.room + ".") : (seer.room + "에 앉으셨습니다.") });
    push({ role: "system", text: en ? seer.rumor : ("손님들 사이 소문 — " + seer.rumor) });
    push({ role: "system", text: en ? "You may tap a question chip below." : "아래 질문 칩을 눌러도 됩니다." });
    push({ role: "seer", text: en
      ? ((active.birth.name || "Guest") + ". " + active.chart.dayMaster + " day-master, " + active.chart.animal + " year. " + active.birth.concern + ".")
      : ((active.birth.name || "손님") + "씨. " + active.chart.dayMaster + "일간 " + active.chart.animal + "띠. " + active.birth.concern + "을 들고 오셨군요.") });
    setBusy(true);
    window.setTimeout(() => {
      push({ role: "seer", text: en
        ? ("The " + active.chart.year + " year pillar sits heavy. Ask what weighs on you.")
        : (active.chart.year + " 년주가 무겁습니다. 오늘 가장 걸리는 한 줄을 말씀하세요.") });
      setBusy(false);
    }, 50);
  }, [sessionOk, active, push, seer.rumor, seer.room]);

  useEffect(() => {
    if (!sessionOk || !active) return;
    const t = window.setInterval(() => {
      const ms = remain(active.endsAt);
      setLeft(ms);
      if (ms <= 600_000 && ms > 300_000) setWarn10(true);
      if (ms <= 300_000 && ms > 180_000) { setWarn10(false); setWarn5(true); }
      if (ms <= 180_000 && ms > 60_000) { setWarn5(false); setWarn3(true); }
      if (ms <= 60_000 && ms > 0) { setWarn3(false); setWarn1(true); }
      if (ms <= 0) endNow();
    }, 1000);
    return () => window.clearInterval(t);
  }, [sessionOk, active?.endsAt]);

  useEffect(() => {
    if (!sessionOk) return;
    const t = window.setTimeout(() => setDrawOpen(false), 50);
    return () => window.clearTimeout(t);
  }, [sessionOk]);

  useEffect(() => {
    if (!sessionOk || !active) return;
    if (active.messages.some((m) => m.role === "guest")) return;
    const t = window.setTimeout(() => {
      if (useGame.getState().active?.messages.some((m) => m.role === "guest")) return;
      const en = isEn(active.birth.name);
      const cues = en ? EN_CUES[active.birth.concern] : CUES[active.birth.concern];
      void send(cues[0]);
    }, 320);
    return () => window.clearTimeout(t);
  }, [sessionOk]);

  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [active?.messages, busy]);
  useEffect(() => {
    if (busy || !queue.length || !active) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    void send(next);
  }, [busy, queue]);
  useEffect(() => {
    if (!foldArmed) return;
    const t = window.setTimeout(() => setFoldArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [foldArmed]);

  async function send(text?: string) {
    const t = (text ?? draftRef.current).trim();
    if (!t || !active) return;
    if (busy) { setQueue((q) => [...q, t]); setDraft(""); return; }
    setDraft("");
    push({ role: "guest", text: t });
    setBusy(true);
    window.setTimeout(() => {
      const en = isEn(active.birth.name);
      const reply = localReply(seer.name, active.chart, active.birth.concern, t, en);
      push({ role: "seer", text: reply });
      if (!mute && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(reply);
        u.lang = en ? "en-US" : "ko-KR";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
      setBusy(false);
    }, 50);
  }

  function endNow() {
    if (!active) return;
    const en = isEn(active.birth.name);
    const slip = en ? (active.chart.summary + "\nHold the season.") : (active.chart.summary + "\n이 계절을 붙드십시오.");
    const closed = close(slip);
    if (closed) void nav("/slip/" + closed.id);
  }
  function onFold() {
    if (!foldArmed) { setFoldArmed(true); return; }
    endNow();
  }
  function toggleMic() {
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setDraft((d) => d || (isEn(useGame.getState().birth.name) ? "This device cannot listen. Write instead." : "이 기기는 말듣기를 지원하지 않습니다. 글로 적어 주세요."));
      return;
    }
    if (listening) { setListening(false); return; }
    const r = new SR();
    r.lang = isEn(useGame.getState().birth.name) ? "en-US" : "ko-KR";
    r.interimResults = true;
    r.onresult = (ev: any) => {
      let out = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) out += ev.results[i][0].transcript;
      setDraft(out.trim());
    };
    r.onend = () => setListening(false);
    setListening(true);
    try { r.start(); } catch { setListening(false); }
  }

  if (!seer) return <main className="grid min-h-dvh place-items-center bg-bg text-fg"><p>없는 문입니다.</p></main>;
  if (!sessionOk || !active) {
    const enEmpty = isEn(useGame.getState().birth.name);
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
        <p className="font-[family-name:var(--font-display)] text-xl">{enEmpty ? "The room is not open yet." : "아직 방이 열리지 않았습니다."}</p>
        <button type="button" className="min-h-12 rounded-md bg-accent px-5 text-accent-foreground" onClick={() => void nav("/house")}>{enEmpty ? "Back to the house" : "당으로"}</button>
      </main>
    );
  }

  const en = isEn(active.birth.name);
  const cues = en ? EN_CUES[active.birth.concern] : CUES[active.birth.concern];
  const sent = new Set(active.messages.filter((m) => m.role === "guest").map((m) => m.text));
  const cards = en ? ["Past", "Now", "Ahead"] : ["과거", "지금", "앞날"];
  const extraLarge = active.birth.year > 0 && active.birth.year <= 1955;
  const mainCls = "relative min-h-dvh overflow-hidden bg-bg text-fg" + (extraLarge ? " session-xl" : fontLarge ? " session-large" : "");
  const showCues = !warn3 && !warn1;
  const pct = Math.max(0, Math.min(100, (left / SESSION_MS) * 100));

  return (
    <main className={mainCls}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, " + seer.color + "55, #0c0a08 70%)" }} />
      {drawOpen ? (
        <button type="button" className="absolute inset-0 z-30 grid place-items-center bg-bg/70 px-6" onClick={() => setDrawOpen(false)}>
          <div className="flex items-end gap-3">
            {cards.map((n, i) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div className={"rounded-md " + (i === 1 ? "h-40 w-28" : "h-36 w-24")} style={{ background: "linear-gradient(145deg,#3a1a16,#b54a3c,#1a1210)" }} />
                <p className="text-xs text-fg/85">{n}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-[family-name:var(--font-display)] text-base">{en ? "Cards open. Tap to sit." : "패를 펼칩니다. 눌러 앉으세요."}</p>
        </button>
      ) : null}
      {pip ? (
        <button type="button" className="pip-cam" onClick={() => setPip(false)}>
          <span className="absolute inset-x-0 bottom-1 text-center text-[10px] text-muted">{en ? "You" : "손님"}</span>
        </button>
      ) : (
        <button type="button" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-35 min-h-10 rounded-full border border-border bg-bg/90 px-3 text-xs text-muted" onClick={() => setPip(true)}>{en ? "Show cam" : "카메라"}</button>
      )}

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col sm:max-w-4xl sm:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col gap-3 p-4 sm:flex">
          <div className="aspect-[3/4] w-full rounded-md" style={{ background: "linear-gradient(160deg, " + seer.color + ", #0c0a08)" }} />
          <p className="font-[family-name:var(--font-display)] text-lg">{seer.name}</p>
          <p className="text-xs text-muted">{seer.title} · {seer.room}</p>
          <div className="hanji flex justify-between gap-1 rounded-lg px-2 py-2 text-center text-[10px]">
            <div><p className="text-muted">{en ? "Y" : "년"}</p><p className="font-[family-name:var(--font-display)] text-sm">{active.chart.year}</p></div>
            <div><p className="text-muted">{en ? "M" : "월"}</p><p className="font-[family-name:var(--font-display)] text-sm">{active.chart.month}</p></div>
            <div><p className="text-muted">{en ? "D" : "일"}</p><p className="font-[family-name:var(--font-display)] text-sm">{active.chart.day}</p></div>
            <div><p className="text-muted">{en ? "DM" : "일간"}</p><p className="font-[family-name:var(--font-display)] text-sm">{active.chart.dayMaster}</p></div>
          </div>
        </aside>
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-2 px-4 pb-1 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="size-11 shrink-0 rounded-md sm:hidden" style={{ background: seer.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-[family-name:var(--font-display)] text-base sm:hidden">{seer.name}</p>
              <p className="hidden font-[family-name:var(--font-display)] text-base sm:block">{en ? "Twenty minutes" : "이십 분"}</p>
              <p className="text-[10px] text-muted sm:hidden">{seer.room} · {en ? CONCERN_EN[active.birth.concern] : active.birth.concern}</p>
            </div>
            {mute ? <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">{en ? "Muted" : "조용"}</span> : null}
            <p className={"font-[family-name:var(--font-display)] text-sm tabular-nums " + (left <= 180_000 ? "text-accent" : "")}>{fmt(left)} <span className="text-[10px]">{en ? "left" : "남음"}</span></p>
            <button type="button" className={"grid size-11 place-items-center rounded-md border " + (fontLarge || extraLarge ? "border-accent text-accent" : "border-transparent")} onClick={toggleFont}>가</button>
            <button type="button" className="grid size-11 place-items-center rounded-md" onClick={() => { setMute((m) => !m); window.speechSynthesis?.cancel(); }}>
              {mute ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
          </header>
          <div className="mx-4 mb-1 time-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={en ? "Time left" : "남은 시간"}>
            <span style={{ width: pct + "%", background: seer.color }} />
          </div>
          <div className="mx-4 mb-1 flex gap-2 overflow-x-auto sm:hidden">
            <span className="hanji shrink-0 rounded px-2 py-1 text-[10px]"><span className="text-muted">{en ? "Y " : "년 "}</span>{active.chart.year}</span>
            <span className="hanji shrink-0 rounded px-2 py-1 text-[10px]"><span className="text-muted">{en ? "M " : "월 "}</span>{active.chart.month}</span>
            <span className="hanji shrink-0 rounded px-2 py-1 text-[10px]"><span className="text-muted">{en ? "D " : "일 "}</span>{active.chart.day}</span>
            <span className="hanji shrink-0 rounded px-2 py-1 text-[10px]"><span className="text-muted">{en ? "DM " : "일간 "}</span>{active.chart.dayMaster}</span>
          </div>
          {warn10 && !warn5 && !warn3 && !warn1 ? <p className="mx-4 mb-1 rounded-md bg-elevated px-3 py-2 text-center text-xs text-muted">{en ? "Ten minutes left — halfway." : "십 분 남았습니다. 절반이 지났습니다."}</p> : null}
          {warn5 && !warn3 && !warn1 ? <p className="mx-4 mb-1 rounded-md bg-elevated px-3 py-2 text-center text-xs text-muted">{en ? "Five minutes left." : "오 분 남았습니다."}</p> : null}
          {warn3 && !warn1 ? <p className="mx-4 mb-1 rounded-md bg-accent/20 px-3 py-2 text-center text-xs text-accent">{en ? "Three minutes left." : "삼 분 남았습니다."}</p> : null}
          {warn1 ? <p className="mx-4 mb-1 rounded-md bg-accent/30 px-3 py-2 text-center text-xs text-accent">{en ? "One minute left." : "일 분 남았습니다."}</p> : null}
          {queue.length ? <p className="mx-4 mb-1 text-center text-xs text-muted">{en ? (queue.length + " waiting · will continue") : ("대기 " + queue.length + " · 이어서 받습니다")}</p> : null}
          <div ref={logRef} role="log" className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <ul className="flex flex-col gap-3">
              {active.messages.map((msg) => (
                <li key={msg.id} className={"flex w-fit max-w-sm flex-col gap-1 " + (msg.role === "guest" ? "ml-auto items-end" : msg.role === "system" ? "mx-auto" : "mr-auto items-start")}>
                  {msg.role === "guest" ? (
                    <p className="rounded-lg bg-elevated px-3 py-2 text-sm whitespace-pre-wrap">{msg.text}</p>
                  ) : msg.role === "system" ? (
                    <p className="text-center text-xs text-muted">{msg.text}</p>
                  ) : (
                    <>
                      <p className="text-xs text-muted">{seer.name}</p>
                      <p className="hanji rounded-lg px-3 py-2 font-[family-name:var(--font-display)] text-base whitespace-pre-wrap" style={{ borderLeft: "3px solid " + seer.color }}>{msg.text}</p>
                    </>
                  )}
                </li>
              ))}
              {busy ? <li className="mr-auto"><p className="hanji wait-pulse rounded-lg px-3 py-2 text-sm" style={{ borderLeft: "3px solid " + seer.color }}>{en ? "Reading the chart" : "사주를 짚고 있습니다"}</p></li> : null}
            </ul>
          </div>
          <form className="border-t border-border bg-bg/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            {showCues ? (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {cues.map((cue) => (
                  <button key={cue} type="button" disabled={sent.has(cue)} className={"min-h-12 shrink-0 rounded-full border px-3 py-2 text-sm " + (sent.has(cue) ? "border-border/50 text-subtle" : "border-border bg-bg/80")} onClick={() => void send(cue)}>{cue}</button>
                ))}
              </div>
            ) : null}
            {listening ? <p className="mb-1 text-center text-xs text-accent">{en ? "Listening…" : "듣는 중…"}</p> : null}
            <div className="flex items-end gap-2">
              <button type="button" className={"grid size-12 place-items-center rounded-full border " + (listening ? "wait-pulse border-accent bg-accent text-accent-foreground" : "border-border bg-elevated")} onClick={toggleMic} aria-label={en ? "Microphone" : "마이크"}><Mic className="size-5" /></button>
              <textarea className="min-h-12 max-h-28 flex-1 resize-none rounded-md border border-border bg-elevated px-3 py-2 text-base" rows={1} value={draft} placeholder={queue.length ? (en ? "Queued — keep writing" : "대기 중 · 이어서 적어도 됩니다") : (en ? "Ask in your words" : "글로 물어도 됩니다")} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} />
              <button type="submit" className="inline-flex min-h-12 min-w-20 items-center justify-center gap-1 rounded-md bg-accent px-3 text-accent-foreground disabled:opacity-40" disabled={left <= 0 || !draft.trim()}>{en ? "Send" : "전하다"} <Send className="size-4" /></button>
            </div>
            <button type="button" className={"mt-2 w-full min-h-11 rounded-md text-sm " + (foldArmed ? "bg-accent/20 text-accent" : "text-muted")} onClick={onFold}>
              {foldArmed ? (en ? "Tap again to fold" : "한 번 더 누르면 접습니다") : (en ? "Fold the slip" : "점사를 접다")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
