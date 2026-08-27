import { Link } from "react-router-dom";
import { CONCERN_EN, isEn, SEERS, SEER_MAP } from "@/lib/seers";
import { useGame } from "@/lib/store";
export function Archive() {
  const archive = useGame((s) => s.archive);
  const birth = useGame((s) => s.birth);
  const en = isEn(birth.name);
  return (
    <main className="mx-auto min-h-dvh max-w-lg bg-bg px-5 pb-28 pt-16 text-fg">
      <p className="text-xs tracking-[0.22em] text-muted">{en ? "Past slips" : "지난 점사"}</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
        {en ? "Paper" : "종이"}
        {archive.length > 0 ? <span className="ml-2 text-base text-muted">· {archive.length}</span> : null}
      </h1>
      {archive.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-muted">{en ? "No folded slips yet." : "아직 접은 점사가 없습니다."}</p>
          <div className="mt-4 flex gap-2" aria-hidden>
            {SEERS.map((s) => <span key={s.id} className="size-2.5 rounded-full" style={{ background: s.color }} />)}
          </div>
          <Link to="/house" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-5 text-accent-foreground">{en ? "Sit for a reading" : "점사를 보러 들다"}</Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {archive.map((r) => (
            <li key={r.id}>
              <Link to={"/slip/" + r.id} className="hanji flex items-center gap-3 rounded-xl p-4">
                <span className="size-12 rounded-md" style={{ background: SEER_MAP[r.seerId].color }} />
                <span className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-lg">{SEER_MAP[r.seerId].name}</p>
                  <p className="mt-1 text-xs text-subtle">{SEER_MAP[r.seerId].room} · {new Date(r.startedAt).toLocaleDateString(en ? "en-US" : "ko-KR")} · {en ? CONCERN_EN[r.birth.concern] : r.birth.concern}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{r.slip || r.chart.summary}</p>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/house" className="mt-8 inline-block min-h-11 text-sm text-accent">{en ? "Back to the house" : "당으로"}</Link>
    </main>
  );
}
