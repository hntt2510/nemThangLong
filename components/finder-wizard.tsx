"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FinderFeel, FinderPriority, FinderQuery } from "@/lib/finder";
import type { DiscoveryProduct } from "@/lib/discovery";

export function FinderWizard({ products, query, hasVerifiedPrices }: { products: DiscoveryProduct[]; query: FinderQuery; hasVerifiedPrices: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [state, setState] = useState(query);
  const combinations = useMemo(() => products.flatMap((product) => product.combinations), [products]);
  const widths = [...new Set(combinations.map((item) => item.width))].sort((a, b) => a - b);
  const lengths = [...new Set(combinations.filter((item) => state.width === null || item.width === state.width).map((item) => item.length))].sort((a, b) => a - b);
  const thicknesses = [...new Set(combinations.filter((item) => (state.width === null || item.width === state.width) && (state.length === null || item.length === state.length)).map((item) => item.thickness))].sort((a, b) => a - b);
  const lengthsFor = (width: number | null) => [...new Set(combinations.filter((item) => width === null || item.width === width).map((item) => item.length))].sort((a, b) => a - b);
  const thicknessesFor = (width: number | null, length: number | null) => [...new Set(combinations.filter((item) => (width === null || item.width === width) && (length === null || item.length === length)).map((item) => item.thickness))].sort((a, b) => a - b);

  function update<K extends keyof FinderQuery>(key: K, value: FinderQuery[K]) {
    setState((current) => {
      const next = { ...current, [key]: value };
      if (key === "width") {
        const nextLengths = lengthsFor(next.width);
        if (next.length !== null && !nextLengths.includes(next.length)) next.length = nextLengths[0] ?? null;
      }
      if (key === "width" || key === "length") {
        const nextThicknesses = thicknessesFor(next.width, next.length);
        if (next.thickness !== null && !nextThicknesses.includes(next.thickness)) next.thickness = nextThicknesses[0] ?? null;
      }
      return next;
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value !== null && value !== "unsure" && value !== false) params.set(key, String(value));
    }
    router.push((pathname + (params.toString() ? "?" + params.toString() : "#results")) as never);
  }

  return (
    <form id="finder-form" className="finder-wizard" onSubmit={submit}>
      <p className="finder-progress" aria-live="polite">Bước {step + 1} / 3</p>
      {step === 0 && <fieldset><legend>Kích thước bạn đang tìm</legend><div className="finder-fields">
        <label>Rộng<select value={state.width ?? ""} onChange={(event) => update("width", event.target.value ? Number(event.target.value) : null)}><option value="">Tất cả</option>{widths.map((value) => <option key={value} value={value}>{value} cm</option>)}</select></label>
        <label>Dài<select value={state.length ?? ""} onChange={(event) => update("length", event.target.value ? Number(event.target.value) : null)}><option value="">Tất cả</option>{lengths.map((value) => <option key={value} value={value}>{value} cm</option>)}</select></label>
        <label>Độ dày<select value={state.thickness ?? ""} onChange={(event) => update("thickness", event.target.value ? Number(event.target.value) : null)}><option value="">Tất cả</option>{thicknesses.map((value) => <option key={value} value={value}>{value} cm</option>)}</select></label>
      </div></fieldset>}
      {step === 1 && <fieldset><legend>Cảm giác và ngân sách</legend><div className="finder-fields">
        <label>Cảm giác<select value={state.feel} onChange={(event) => update("feel", event.target.value as FinderFeel)}><option value="unsure">Chưa chắc</option><option value="soft">Êm hơn</option><option value="balanced">Cân bằng</option><option value="firm">Vững hơn</option></select></label>
        {hasVerifiedPrices && <label>Ngân sách tối đa (VND)<input type="number" min="1" value={state.maxPrice ?? ""} onChange={(event) => update("maxPrice", event.target.value ? Number(event.target.value) : null)} /></label>}
      </div></fieldset>}
      {step === 2 && <fieldset><legend>Ưu tiên khi ngủ</legend><div className="finder-fields">
        <label>Ưu tiên<select value={state.priority} onChange={(event) => update("priority", event.target.value as FinderPriority)}><option value="unsure">Chưa chắc</option><option value="support">Nâng đỡ</option><option value="breathability">Thoáng khí</option><option value="motion-isolation">Giảm truyền động</option></select></label>
        <label className="finder-check"><input type="checkbox" checked={state.inStock} onChange={(event) => update("inStock", event.target.checked)} /> Chỉ xem biến thể còn hàng</label>
      </div></fieldset>}
      <div className="finder-actions">{step > 0 && <button type="button" className="button button-secondary" onClick={() => setStep((value) => value - 1)}>Quay lại</button>}{step < 2 ? <button type="button" className="button button-primary" onClick={() => setStep((value) => value + 1)}>Tiếp theo</button> : <button type="submit" className="button button-primary">Xem gợi ý</button>}</div>
    </form>
  );
}
