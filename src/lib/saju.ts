import type { Concern } from "./seers";
const STEMS = ["갑","을","병","정","무","기","경","신","임","계"];
const BRANCH = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const ANIMALS = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
export type Chart = { dayMaster: string; animal: string; year: string; month: string; day: string; hour: string | null; summary: string };
export function buildChart(b: { year: number; month: number; day: number; hour: number | null; timeUnknown: boolean; concern: Concern; name: string }): Chart {
  const yi = b.year - 1984;
  const di = Math.round(Date.UTC(b.year, b.month - 1, b.day) / 86400000 - Date.UTC(1984, 1, 2) / 86400000);
  const ys = ((yi % 10) + 10) % 10;
  const yb = ((yi % 12) + 12) % 12;
  const ds = ((di % 10) + 10) % 10;
  const db = ((di % 12) + 12) % 12;
  const hour = b.timeUnknown || b.hour == null ? null : BRANCH[Math.floor(((b.hour + 1) % 24) / 2)];
  return {
    dayMaster: STEMS[ds], animal: ANIMALS[yb],
    year: STEMS[ys] + BRANCH[yb],
    month: STEMS[(ys + b.month) % 10] + BRANCH[(yb + b.month) % 12],
    day: STEMS[ds] + BRANCH[db],
    hour: hour ? STEMS[ds] + hour : null,
    summary: STEMS[ds] + "일간 " + ANIMALS[yb] + "띠. " + b.concern + "을 들고 온 자리.",
  };
}
