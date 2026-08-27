export type SeerId = "wolha" | "cheongsong" | "heukseol" | "geumran" | "bukdu";
export type Concern = "전체운" | "연애·인연" | "재물·사업" | "직장·진로" | "가족·건강" | "이직·결단";
export type Seer = { id: SeerId; name: string; title: string; room: string; wait: string; rumor: string; color: string };
export const HOUSE = "월하당";
export const TAGLINE = "복채 오만원 · 이십 분";
export const FEE = 50_000;
export const SESSION_MS = 20 * 60 * 1000;
export const CONCERNS: Concern[] = ["전체운", "연애·인연", "재물·사업", "직장·진로", "가족·건강", "이직·결단"];
export const CONCERN_EN: Record<Concern, string> = {
  전체운: "Overall", "연애·인연": "Love", "재물·사업": "Wealth", "직장·진로": "Career", "가족·건강": "Family", "이직·결단": "Decision",
};
export const SEERS: Seer[] = [
  { id: "wolha", name: "월하보살", title: "신점 · 쪽집게", room: "적등방", wait: "예약 대기 열흘", rumor: "말도 안 했는데 집안일을 맞췄다.", color: "#b54a3c" },
  { id: "cheongsong", name: "청송선생", title: "정통 명리", room: "묵향재", wait: "오후 세 자리", rumor: "감이 아니라 격국과 용신으로 말한다.", color: "#4a5c4e" },
  { id: "heukseol", name: "흑설보살", title: "직언 · 독설", room: "한등실", wait: "당일 한 자리", rumor: "위로 없이 한 줄이 나중에 약이 됐다.", color: "#3a3a42" },
  { id: "geumran", name: "금란선녀", title: "인연 · 궁합", room: "실연헌", wait: "대기 세 달", rumor: "상대 생일 없이도 실의 꼬임을 본다.", color: "#8a4a5a" },
  { id: "bukdu", name: "북두도사", title: "재물 · 사업", room: "금고당", wait: "오전에 세 자리", rumor: "손대면 안 되는 달을 찍어 준다.", color: "#7a6520" },
];
export const SEER_MAP = Object.fromEntries(SEERS.map((s) => [s.id, s])) as Record<SeerId, Seer>;
export function recommend(c: Concern): SeerId {
  if (c === "연애·인연") return "geumran";
  if (c === "재물·사업") return "bukdu";
  if (c === "직장·진로") return "cheongsong";
  if (c === "가족·건강") return "wolha";
  if (c === "이직·결단") return "heukseol";
  return "cheongsong";
}
export function doors(c: Concern) {
  const r = recommend(c);
  return [...SEERS].sort((a, b) => Number(b.id === r) - Number(a.id === r));
}
export function isEn(name: string) {
  return Boolean(name.trim()) && !/[가-힣]/.test(name);
}
