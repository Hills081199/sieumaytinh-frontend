import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Zap, Plus, X, Trophy, ChevronDown, ChevronUp, Loader2, CheckCircle2,
  AlertCircle, Link2, RefreshCw, Copy, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { FORMATION_OPTIONS } from "@/lib/formations";
import { FormationPitch } from "@/components/prediction/FormationPitch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Siêu Máy Tính Dự Đoán Bóng Đá" },
      { name: "description", content: "Công cụ phân tích và dự đoán kết quả bóng đá bằng AI — mã đầu tư chấp, trên dưới, phạt góc." },
      { property: "og:title", content: "Siêu Máy Tính Dự Đoán Bóng Đá" },
      { property: "og:description", content: "Phân tích trận đấu, đội hình và mã đầu tư với AI." },
    ],
  }),
  component: Index,
});

type MatchType = "Giao hữu" | "Vòng bảng" | "Tứ kết" | "Bán kết" | "Chung kết";
type LinkStatus = "idle" | "loading" | "done" | "error";
interface NewsLink { id: string; url: string; status: LinkStatus; summary?: string }
interface CustomBet { id: string; name: string; value: string }

const HANDICAP_VALUES = ["0", "0.25", "0.5", "0.75", "1", "1.25", "1.5", "-0.25", "-0.5", "-0.75", "-1"];
const GOAL_LINES = ["1.5", "2", "2.5", "3", "3.5", "4", "4.5"];
const CORNER_LINES = ["7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"];
const MATCH_TYPES: MatchType[] = ["Giao hữu", "Vòng bảng", "Tứ kết", "Bán kết", "Chung kết"];

const uid = () => Math.random().toString(36).slice(2, 9);

function Index() {
  // Step 1
  const [league, setLeague] = useState("World cup 2026");
  const [matchType, setMatchType] = useState<MatchType>("Vòng bảng");
  const [weather, setWeather] = useState("Nhiệt độ 20°C, mây nhiều, gió 10km/h");
  const [homeTeam, setHomeTeam] = useState("Canada");
  const [awayTeam, setAwayTeam] = useState("Thụy Sĩ");

  // Step 3
  const [handicapTeam, setHandicapTeam] = useState<"home" | "away">("home");
  const [handicapValue, setHandicapValue] = useState("0.25");
  const [handicapOver, setHandicapOver] = useState("1.90");
  const [handicapUnder, setHandicapUnder] = useState("1.95");
  const [goalLine, setGoalLine] = useState("2.5");
  const [goalOver, setGoalOver] = useState("1.85");
  const [goalUnder, setGoalUnder] = useState("2.00");
  const [cornerLine, setCornerLine] = useState("9.5");
  const [cornerOver, setCornerOver] = useState("1.90");
  const [cornerUnder, setCornerUnder] = useState("1.90");
  const [customBets, setCustomBets] = useState<CustomBet[]>([]);
  const [openSections, setOpenSections] = useState({ h: true, g: true, c: true });

  // Step 4
  const [links, setLinks] = useState<NewsLink[]>([
    { id: uid(), url: "https://vietnamnet.vn/du-doan-bong-da-thuy-si-vs-canada-bang-b-world-cup-2026-2h-ngay-25-6-2528618.html", status: "idle" },
    { id: uid(), url: "https://laodong.vn/world-cup-2026/nhan-dinh-bong-da-thuy-si-vs-canada-tai-world-cup-2026-1723993.ldo", status: "idle" },
    { id: uid(), url: "https://baonghean.vn/en/quyet-dau-thuy-si-vs-canada-phan-dinh-ngoi-dau-bang-b-world-cup-2026-10341762.html", status: "idle" },
  ]);
  const [extraNotes, setExtraNotes] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showMissingFormationPopup, setShowMissingFormationPopup] = useState(false);

  const addLink = () => { if (links.length < 10) setLinks([...links, { id: uid(), url: "", status: "idle" }]); };
  const updateLink = (id: string, patch: Partial<NewsLink>) => setLinks(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  const removeLink = (id: string) => setLinks(ls => ls.filter(l => l.id !== id));

  const addCustomBet = () => setCustomBets(b => [...b, { id: uid(), name: "", value: "" }]);
  const updateCustomBet = (id: string, patch: Partial<CustomBet>) => setCustomBets(b => b.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeCustomBet = (id: string) => setCustomBets(b => b.filter(x => x.id !== id));

  const runPrediction = async () => {
    const validNewsUrls = links.filter(l => l.url.trim() !== "");

    if (validNewsUrls.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 URL tin tức để AI có dữ liệu phân tích.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload = {
        league,
        match_type: matchType,
        home_team: homeTeam,
        away_team: awayTeam,
        signals: {
          handicap: handicapTeam === "home" ? `${homeTeam} chấp ${handicapValue}` : `${awayTeam} chấp ${handicapValue}`,
          total_goals_ou: goalLine,
          total_corners_ou: cornerLine
        },
        news_urls: validNewsUrls.map(l => l.url.trim()),
        weather: weather + (extraNotes ? ` (Ghi chú: ${extraNotes})` : ""),
        "match-date": "2026-06-25",
        "match-type-extrainfo": ""
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.job_id) throw new Error("Không tạo được job phân tích");

      const jobId = data.job_id;

      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://127.0.0.1:8000/api/v1/jobs/${jobId}`);
          const statusData = await statusRes.json();
          if (statusData.status === "completed") {
            clearInterval(poll);
            let finalResult = statusData.result;
            if (finalResult.includes("[THIEU_DOI_HINH]")) {
              setShowMissingFormationPopup(true);
              finalResult = finalResult.replace(/\[THIEU_DOI_HINH\]/g, "").trim();
            }
            setResult(finalResult);
            setLoading(false);
            window.setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
          } else if (statusData.status === "failed") {
            clearInterval(poll);
            setResult("Có lỗi xảy ra trong quá trình phân tích:\n\n" + statusData.error);
            setLoading(false);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    } catch (e) {
      console.error(e);
      setResult("Không thể kết nối đến máy chủ AI.");
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <StepIndicator current={result ? 5 : loading ? 4 : 1} />

        {/* STEP 1 */}
        <GlassCard>
          <SectionHeader step={1} title="Thông Tin Trận Đấu" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Giải đấu">
              <Input value={league} onChange={e => setLeague(e.target.value)} placeholder="VD: Premier League, Champions League..." />
            </Field>
            <Field label="Tính chất trận đấu">
              <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-950/50 p-1 border border-slate-800">
                {MATCH_TYPES.map(t => (
                  <button key={t} onClick={() => setMatchType(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${matchType === t ? "bg-blue-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Thời tiết dự kiến">
              <Input value={weather} onChange={e => setWeather(e.target.value)} placeholder="VD: Trời mát, không mưa" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <TeamCard color="blue" label="Đội nhà" name={homeTeam} setName={setHomeTeam} />
            <TeamCard color="red" label="Đội khách" name={awayTeam} setName={setAwayTeam} />
          </div>
        </GlassCard>

        {/* STEP 2: Các Loại Mã Đầu Tư (trước là Step 3) */}
        <GlassCard>
          <SectionHeader step={2} title="Các Loại Mã Đầu Tư" />
          <div className="space-y-3">
            <BetSection title="MÃ ĐẦU TƯ CHẤP (Asian Handicap)" open={openSections.h} onToggle={() => setOpenSections(s => ({ ...s, h: !s.h }))}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Đội chấp">
                  <Select value={handicapTeam} onChange={e => setHandicapTeam(e.target.value as "home" | "away")}>
                    <option value="home">{homeTeam || "Đội nhà"}</option>
                    <option value="away">{awayTeam || "Đội khách"}</option>
                  </Select>
                </Field>
                <Field label="Mức chấp">
                  <Select value={handicapValue} onChange={e => setHandicapValue(e.target.value)}>
                    {HANDICAP_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                  </Select>
                </Field>
                <Field label="Odds chấp trên"><Input type="number" step="0.01" value={handicapOver} onChange={e => setHandicapOver(e.target.value)} /></Field>
                <Field label="Odds chấp dưới"><Input type="number" step="0.01" value={handicapUnder} onChange={e => setHandicapUnder(e.target.value)} /></Field>
              </div>
            </BetSection>

            <BetSection title="MÃ ĐẦU TƯ TRÊN DƯỚI BÀN (Over/Under Goals)" open={openSections.g} onToggle={() => setOpenSections(s => ({ ...s, g: !s.g }))}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Mức tổng bàn">
                  <Select value={goalLine} onChange={e => setGoalLine(e.target.value)}>
                    {GOAL_LINES.map(v => <option key={v} value={v}>{v}</option>)}
                  </Select>
                </Field>
                <Field label="Odds Trên"><Input type="number" step="0.01" value={goalOver} onChange={e => setGoalOver(e.target.value)} /></Field>
                <Field label="Odds Dưới"><Input type="number" step="0.01" value={goalUnder} onChange={e => setGoalUnder(e.target.value)} /></Field>
              </div>
            </BetSection>

            <BetSection title="MÃ ĐẦU TƯ PHẠT GÓC (Over/Under Corners)" open={openSections.c} onToggle={() => setOpenSections(s => ({ ...s, c: !s.c }))}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Mức tổng góc">
                  <Select value={cornerLine} onChange={e => setCornerLine(e.target.value)}>
                    {CORNER_LINES.map(v => <option key={v} value={v}>{v}</option>)}
                  </Select>
                </Field>
                <Field label="Odds Trên"><Input type="number" step="0.01" value={cornerOver} onChange={e => setCornerOver(e.target.value)} /></Field>
                <Field label="Odds Dưới"><Input type="number" step="0.01" value={cornerUnder} onChange={e => setCornerUnder(e.target.value)} /></Field>
              </div>
            </BetSection>

            {customBets.length > 0 && (
              <div className="space-y-2">
                {customBets.map(b => (
                  <div key={b.id} className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <Input value={b.name} onChange={e => updateCustomBet(b.id, { name: e.target.value })} placeholder="Tên mã đầu tư" />
                    <Input value={b.value} onChange={e => updateCustomBet(b.id, { value: e.target.value })} placeholder="Giá trị" />
                    <button onClick={() => removeCustomBet(b.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition shrink-0"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={addCustomBet} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 transition text-sm">
              <Plus className="h-4 w-4" /> Thêm mã đầu tư khác
            </button>
          </div>
        </GlassCard>

        {/* STEP 3 */}
        <GlassCard>
          <SectionHeader step={3} title="Nguồn Thông Tin (AI sẽ đọc)" subtitle="Thêm link bài báo hoặc nhận định để AI phân tích" />
          <div className="space-y-2">
            {links.map(l => (
              <NewsLinkRow key={l.id} link={l} onChange={p => updateLink(l.id, p)} onRemove={() => removeLink(l.id)} />
            ))}
          </div>
          <button onClick={addLink} disabled={links.length >= 10}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 transition text-sm disabled:opacity-50 disabled:hover:border-slate-700 disabled:hover:text-slate-400">
            <Plus className="h-4 w-4" /> Thêm link {links.length >= 10 && "(tối đa 10)"}
          </button>

          <div className="mt-6">
            <label className="block text-sm text-slate-300 mb-2">Nhận định bổ sung (tùy chọn)</label>
            <textarea value={extraNotes} onChange={e => setExtraNotes(e.target.value)} rows={4}
              placeholder="Thêm ghi chú, dự đoán riêng, hoặc thông tin thêm về cầu thủ chấn thương..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition resize-none" />
          </div>
        </GlassCard>

        {/* REVIEW */}
        <GlassCard>
          <button onClick={() => setReviewOpen(o => !o)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><Sparkles className="h-4 w-4" /></div>
              <div className="text-left">
                <div className="text-base font-semibold text-white">Xem lại thông tin</div>
                <div className="text-xs text-slate-400">{homeTeam} vs {awayTeam} • {league}</div>
              </div>
            </div>
            {reviewOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          {reviewOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <ReviewItem label="Giải đấu" value={league} />
              <ReviewItem label="Tính chất" value={matchType} />
              <ReviewItem label="Thời tiết" value={weather} />
              <ReviewItem label="Đội nhà" value={homeTeam} />
              <ReviewItem label="Đội khách" value={awayTeam} />
              <ReviewItem label="Mã đầu tư chấp" value={`${handicapTeam === "home" ? homeTeam : awayTeam} chấp ${handicapValue} (${handicapOver}/${handicapUnder})`} />
              <ReviewItem label="Trên dưới bàn" value={`${goalLine} (Trên ${goalOver} / Dưới ${goalUnder})`} />
              <ReviewItem label="Phạt góc" value={`${cornerLine} (Trên ${cornerOver} / Dưới ${cornerUnder})`} />
              <ReviewItem label="Nguồn" value={`${links.length} link, ${extraNotes ? "có" : "không"} ghi chú`} />
            </div>
          )}
        </GlassCard>

        {/* CTA */}
        <button onClick={runPrediction} disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl px-6 py-5 text-lg font-bold text-white shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_-5px_rgba(59,130,246,0.9)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6 50%, #06b6d4)" }}>
          <span className="relative z-10 inline-flex items-center justify-center gap-3 tracking-wide">
            <Zap className="h-6 w-6 fill-yellow-300 text-yellow-300 drop-shadow" />
            SIÊU MÁY TÍNH PHÂN TÍCH
          </span>
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition" />
        </button>

        {loading && <LoadingCard />}
        {result && <ResultsView result={result} homeTeam={homeTeam} awayTeam={awayTeam} onReset={reset} />}

        {showMissingFormationPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Thiếu thông tin đội hình!</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                AI không tìm thấy sơ đồ chiến thuật và đội hình ra sân dự kiến từ các nguồn tin tức bạn cung cấp. Điều này có thể làm giảm độ chính xác của báo cáo phân tích chiến thuật. Bạn có muốn thêm link bài báo khác chứa đội hình không?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowMissingFormationPopup(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Bỏ qua, xem kết quả
                </button>
                <button
                  onClick={() => {
                    setShowMissingFormationPopup(false);
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/30"
                >
                  Thêm link báo
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 py-8">Siêu Máy Tính Dự Đoán Bóng Đá • Được hỗ trợ bởi AI</p>
      </main>
    </div>
  );
}

/* ---------- helpers / sub-components ---------- */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 py-3.5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-bold tracking-tight text-white leading-none">Siêu Máy Tính Dự Đoán Bóng Đá</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Phân tích trận đấu bằng AI</p>
        </div>
      </div>
    </header>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Thông tin", "Mã đầu tư", "Nguồn AI", "Kết quả"];
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n <= current;
        const done = n < current;
        return (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${active ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"}`}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span className={`text-xs font-medium ${active ? "text-white" : "text-slate-500"}`}>{s}</span>
            {i < steps.length - 1 && <span className={`h-px w-6 ${active ? "bg-blue-500/50" : "bg-slate-800"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 p-6 md:p-8 shadow-xl">{children}</section>;
}

function SectionHeader({ step, title, subtitle }: { step?: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        {step !== undefined && <span className="text-xs font-mono text-blue-400">BƯỚC {step}</span>}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition ${props.className ?? ""}`} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition" />;
}

function TeamCard({ color, label, name, setName }: {
  color: "blue" | "red"; label: string; name: string; setName: (v: string) => void;
}) {
  const initials = useMemo(() => name.split(" ").map(s => s[0]).join("").slice(0, 3).toUpperCase() || "?", [name]);
  const ring = color === "blue" ? "ring-blue-500/40 bg-blue-500" : "ring-red-500/40 bg-red-500";
  return (
    <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-4">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">{label}</div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-14 w-14 rounded-full ${ring} ring-4 flex items-center justify-center text-white font-bold shadow-lg`}>{initials}</div>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tên đội" />
      </div>
    </div>
  );
}

function BetSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-950/50 border border-slate-800 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/50 transition">
        <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-2 border-t border-slate-800/60">{children}</div>}
    </div>
  );
}

function NewsLinkRow({ link, onChange, onRemove }: { link: NewsLink; onChange: (p: Partial<NewsLink>) => void; onRemove: () => void }) {
  const fakeFetch = () => {
    onChange({ status: "loading" });
    setTimeout(() => {
      // 90% success
      if (Math.random() < 0.9 && /^https?:\/\//i.test(link.url)) {
        onChange({ status: "done", summary: "AI đã phân tích nội dung bài báo — thông tin về phong độ, đội hình và dự đoán từ chuyên gia." });
      } else {
        onChange({ status: "error", summary: undefined });
      }
    }, 1400);
  };
  return (
    <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-slate-900 text-slate-500"><Link2 className="h-4 w-4" /></div>
        <Input value={link.url} onChange={e => onChange({ url: e.target.value, status: "idle", summary: undefined })} placeholder="https://..." />
        <button onClick={fakeFetch} disabled={!link.url || link.status === "loading"}
          className="px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30 transition disabled:opacity-50 shrink-0">
          Đọc
        </button>
        <StatusBadge status={link.status} />
        <button onClick={onRemove} className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"><X className="h-4 w-4" /></button>
      </div>
      {link.summary && <p className="mt-2 px-1 text-xs text-slate-500 leading-relaxed">{link.summary}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: LinkStatus }) {
  const map = {
    idle: { cls: "bg-slate-800 text-slate-400 border-slate-700", label: "Chưa xử lý", icon: null },
    loading: { cls: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Đang đọc", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    done: { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", label: "Đã đọc", icon: <CheckCircle2 className="h-3 w-3" /> },
    error: { cls: "bg-red-500/10 text-red-400 border-red-500/30", label: "Lỗi", icon: <AlertCircle className="h-3 w-3" /> },
  }[status];
  return <span className={`hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium shrink-0 ${map.cls}`}>{map.icon}{map.label}</span>;
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm text-slate-200 mt-0.5 truncate">{value}</div>
    </div>
  );
}

/* ---------- Loading ---------- */
const LOADING_MESSAGES = [
  "Đang phân tích đội hình...",
  "Đang đọc các bài báo...",
  "Đang tính toán xác suất...",
  "Tổng hợp kết quả...",
];
function LoadingCard() {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(8);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 1000);
    const p = setInterval(() => setProgress(v => Math.min(96, v + Math.random() * 12)), 350);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);
  return (
    <section className="rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mb-5 animate-spin" style={{ animationDuration: "1.6s" }}>
        <Trophy className="h-7 w-7 text-blue-400" />
      </div>
      <div className="text-lg font-semibold text-white">{LOADING_MESSAGES[idx]}</div>
      <p className="text-xs text-slate-500 mt-1">Vui lòng đợi trong giây lát</p>
      <div className="mt-6 mx-auto max-w-sm h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #3b82f6, #06b6d4)" }} />
      </div>
    </section>
  );
}

/* ---------- Result view ---------- */

function ResultsView({ result, homeTeam, awayTeam, onReset }: { result: string; homeTeam: string; awayTeam: string; onReset: () => void }) {
  const copy = () => {
    navigator.clipboard?.writeText(result);
  };

  // Parse confidence levels from result
  const parseConfidence = (text: string) => {
    const confidenceSectionMatch = text.match(/mức tin cậy[\s\S]*?$/i);
    if (!confidenceSectionMatch) return null;
    const confText = confidenceSectionMatch[0];

    const bets: { name: string; confidence: string; prediction?: string }[] = [];

    const extractConf = (prefix: string) => {
      const lineRegex = new RegExp(`${prefix}[^\\n]+`, "i");
      const lineMatch = confText.match(lineRegex);
      if (lineMatch) {
        if (/cao/i.test(lineMatch[0])) return "Cao";
        if (/trung bình/i.test(lineMatch[0])) return "Trung bình";
        if (/thấp/i.test(lineMatch[0])) return "Thấp";
      }
      return "Chưa rõ";
    };

    const extractPred = (prefix: string) => {
      const regex = new RegExp(`${prefix}[^\\n]*\\n+(?:\\s*\\n)*([^\\n]+)`, "i");
      const match = text.match(regex);
      if (match) {
        let pred = match[1].replace(/^[\s*\-]+|[\s*\-]+$/g, '').trim();
        if (pred.length > 80) pred = pred.substring(0, 77) + "...";
        return pred;
      }
      return "Xem chi tiết bên dưới";
    };

    bets.push({
      name: "Mã Đầu Tư Chấp",
      confidence: extractConf("Mã Đầu Tư 1"),
      prediction: extractPred("Mã Đầu Tư 1")
    });

    bets.push({
      name: "Trên/Dưới Bàn",
      confidence: extractConf("Mã Đầu Tư 2"),
      prediction: extractPred("Mã Đầu Tư 2")
    });

    bets.push({
      name: "Trên/Dưới Góc",
      confidence: extractConf("Mã Đầu Tư 3"),
      prediction: extractPred("Mã Đầu Tư 3")
    });

    return bets;
  };

  const confidenceData = parseConfidence(result);

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <div className="text-xs font-mono text-blue-400 uppercase tracking-widest">Kết Quả Phân Tích</div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold text-white">{homeTeam} <span className="text-slate-500">vs</span> {awayTeam}</h2>
      </div>

      {/* Prediction Summary Card */}
      {confidenceData && confidenceData.length > 0 && (
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">Tóm Tắt Dự Đoán</h3>
            <p className="text-xs text-slate-400">Lựa chọn mã đầu tư cho từng loại kèo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {confidenceData.map((bet, i) => (
              <div key={i} className="rounded-xl border p-4 bg-blue-500/10 text-blue-100 border-blue-500/30">
                <div className="text-xs font-medium uppercase tracking-wider mb-2 text-blue-400/80">{bet.name}</div>
                {bet.prediction && (
                  <div className="text-sm font-bold leading-relaxed">{bet.prediction}</div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="prose prose-invert max-w-none prose-sm text-slate-300">
          {result.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold text-blue-400 mt-6 mb-3">{line.replace('## ', '')}</h3>;
            if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-bold text-blue-500 mt-8 mb-4">{line.replace('# ', '')}</h2>;
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-300 mb-1">{line.replace('- ', '')}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="leading-relaxed mb-2">{line}</p>;
          })}
        </div>
      </GlassCard>

      <p className="text-xs text-slate-500 text-center leading-relaxed px-4 mt-6">
        Lưu ý: Đây là phân tích tham khảo từ AI, không đảm bảo chính xác 100%. Vui lòng cân nhắc và chơi có trách nhiệm.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button onClick={copy} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition">
          <Copy className="h-4 w-4" /> Sao chép kết quả
        </button>
        <button onClick={onReset} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition">
          <RefreshCw className="h-4 w-4" /> Phân tích trận mới
        </button>
      </div>
    </div>
  );
}
