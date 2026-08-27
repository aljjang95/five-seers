import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SESSION_MS, type Concern, type SeerId } from "./seers";
import { buildChart, type Chart } from "./saju";
export type Birth = {
  name: string; gender: string; calendar: string;
  year: number; month: number; day: number; hour: number | null; minute: number;
  timeUnknown: boolean; concern: Concern;
};
export type Msg = { id: string; role: "seer" | "guest" | "system"; text: string };
export type Session = {
  id: string; seerId: SeerId; birth: Birth; chart: Chart;
  startedAt: number; endsAt: number; messages: Msg[]; closed: boolean; slip: string | null;
};
function uid() { return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
function emptyBirth(): Birth {
  return { name: "", gender: "밝히지 않음", calendar: "양력", year: 1992, month: 5, day: 12, hour: 12, minute: 0, timeUnknown: false, concern: "전체운" };
}
type State = {
  birth: Birth; paid: boolean; active: Session | null; archive: Session[]; fontLarge: boolean;
  setBirth: (p: Partial<Birth>) => void; markPaid: () => void;
  start: (seerId: SeerId) => Session; push: (m: Omit<Msg, "id">) => void;
  close: (slip: string) => Session | null; toggleFont: () => void;
};
export function remain(endsAt: number) { return Math.max(0, endsAt - Date.now()); }
export function fmt(ms: number) {
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
export function fee(n: number) { return n.toLocaleString("ko-KR") + "원"; }
export const useGame = create<State>()(
  persist(
    (set, get) => ({
      birth: emptyBirth(), paid: false, active: null, archive: [], fontLarge: false,
      setBirth: (p) => set({ birth: { ...get().birth, ...p } }),
      markPaid: () => set({ paid: true }),
      start: (seerId) => {
        const startedAt = Date.now();
        const birth = get().birth;
        const rec: Session = {
          id: uid(), seerId, birth, chart: buildChart(birth),
          startedAt, endsAt: startedAt + SESSION_MS, messages: [], closed: false, slip: null,
        };
        set({ active: rec });
        return rec;
      },
      push: (m) => {
        const a = get().active;
        if (!a || a.closed) return;
        set({ active: { ...a, messages: [...a.messages, { ...m, id: uid() }] } });
      },
      close: (slip) => {
        const a = get().active;
        if (!a) return null;
        const closed = { ...a, closed: true, slip };
        set({ active: null, paid: false, archive: [closed, ...get().archive].slice(0, 20) });
        return closed;
      },
      toggleFont: () => set({ fontLarge: !get().fontLarge }),
    }),
    {
      name: "wolhadang-v32",
      partialize: (s) => ({ birth: s.birth, archive: s.archive, fontLarge: s.fontLarge, paid: s.paid, active: s.active }),
      merge: (p, c) => {
        const x = (p ?? {}) as Partial<State>;
        return { ...c, ...x, birth: { ...emptyBirth(), ...(x.birth ?? {}) } };
      },
    },
  ),
);
