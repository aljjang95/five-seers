import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { CONCERN_EN, HOUSE, isEn, SEER_MAP } from "@/lib/seers";
import { useGame } from "@/lib/store";
export function Slip() {
  const { id } = useParams();
  const rec = useGame((s) => s.archive.find((r) => r.id === id) ?? null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  if (!rec) {
    const enMiss = isEn(useGame.getState().birth.name);
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center text-fg">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl">{enMiss ? "This slip is gone." : "점사를 찾을 수 없습니다."}</p>
          <Link to="/house" className="mt-4 inline-block min-h-11 text-accent">{enMiss ? "Back to the house" : "당으로"}</Link>
        </div>
      </main>
    );
  }
  const seer = SEER_MAP[rec.seerId];
  const en = isEn(rec.birth.name);
  const body = rec.slip || rec.chart.summary;
  const text = en
    ? (HOUSE + " · " + seer.name + " · " + seer.room + "\n" + (rec.birth.name || "Guest") + " · " + CONCERN_EN[rec.birth.concern] + "\n\n" + body)
    : (HOUSE + " · " + seer.name + " · " + seer.room + "\n" + (rec.birth.name || "손님") + " · " + rec.birth.concern + "\n\n" + body);
  const when = new Date(rec.startedAt).toLocaleString(en ? "en-US" : "ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  function copy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }).catch(() => undefined);
  }
  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: HOUSE + " · " + seer.name, text }).then(() => {
        setShared(true);
        window.setTimeout(() => setShared(false), 1600);
      }).catch(() => copy());
    } else {
      copy();
    }
  }
  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-28 pt-16">
        <p className="text-xs tracking-[0.22em] text-muted">{HOUSE} · {en ? "paper slip" : "종이 점사"} · {seer.room}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="size-14 rounded-md" style={{ background: seer.color }} />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl">{seer.name}</h1>
            <p className="mt-1 text-sm text-muted">{rec.birth.name || (en ? "Guest" : "손님")} · {rec.chart.dayMaster}{en ? " day-master" : "일간"} {rec.chart.animal}{en ? " year" : "띠"}</p>
          </div>
        </div>
        <p className="mt-1 text-xs text-subtle">{when} · {en ? CONCERN_EN[rec.birth.concern] : rec.birth.concern}</p>
        <article className="hanji mt-6 flex-1 whitespace-pre-wrap rounded-xl p-5 font-[family-name:var(--font-display)] text-lg leading-relaxed" style={{ borderLeft: "3px solid " + seer.color }}>{body}</article>
        <div className="mt-4 flex flex-wrap gap-4">
          <button type="button" className="min-h-11 text-sm text-muted underline-offset-4 hover:underline" onClick={copy}>
            {copied ? (en ? "Copied" : "베꼈습니다") : (en ? "Copy slip" : "점사를 베끼다")}
          </button>
          <button type="button" className="min-h-11 text-sm text-muted underline-offset-4 hover:underline" onClick={share}>
            {shared ? (en ? "Shared" : "나눴습니다") : (en ? "Share" : "나누다")}
          </button>
          <Link to="/house" className="min-h-11 text-sm text-muted underline-offset-4 hover:underline">{en ? "See again" : "다시 보다"}</Link>
        </div>
        <Link to="/house" className="mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-5 text-accent-foreground">{en ? "Back to the house" : "당으로 돌아가다"}</Link>
      </div>
    </main>
  );
}
