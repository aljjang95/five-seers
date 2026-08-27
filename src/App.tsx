import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Archive } from "./pages/Archive";
import { House } from "./pages/House";
import { Prologue } from "./pages/Prologue";
import { Session } from "./pages/Session";
import { Slip } from "./pages/Slip";
import { HOUSE } from "./lib/seers";
export default function App() {
  return (
    <BrowserRouter>
      <div className="brand-pill" aria-label="월하당">{HOUSE}</div>
      <Routes>
        <Route path="/" element={<Prologue />} />
        <Route path="/house" element={<House />} />
        <Route path="/session/:seerId" element={<Session />} />
        <Route path="/slip/:id" element={<Slip />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
