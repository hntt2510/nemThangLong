"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FinderFeel, FinderPriority, FinderQuery } from "@/lib/finder";
import type { DiscoveryProduct } from "@/lib/discovery";

export function FinderWizard({
  products,
  query,
  hasVerifiedPrices,
}: {
  products: DiscoveryProduct[];
  query: FinderQuery;
  hasVerifiedPrices: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [state, setState] = useState(query);
  const combinations = useMemo(
    () => products.flatMap((product) => product.combinations),
    [products],
  );
  const widths = [...new Set(combinations.map((item) => item.width))].sort(
    (a, b) => a - b,
  );
  const lengthsFor = (width: number | null) =>
    [
      ...new Set(
        combinations
          .filter((item) => width === null || item.width === width)
          .map((item) => item.length),
      ),
    ].sort((a, b) => a - b);
  const thicknessesFor = (width: number | null, length: number | null) =>
    [
      ...new Set(
        combinations
          .filter(
            (item) =>
              (width === null || item.width === width) &&
              (length === null || item.length === length),
          )
          .map((item) => item.thickness),
      ),
    ].sort((a, b) => a - b);

  const currentLengths = lengthsFor(state.width);
  const currentThicknesses = thicknessesFor(state.width, state.length);

  function update<K extends keyof FinderQuery>(key: K, value: FinderQuery[K]) {
    setState((current) => {
      const next = { ...current, [key]: value };
      if (key === "width") {
        const nextLengths = lengthsFor(next.width);
        if (next.length !== null && !nextLengths.includes(next.length)) {
          next.length = nextLengths[0] ?? null;
        }
      }
      if (key === "width" || key === "length") {
        const nextThicknesses = thicknessesFor(next.width, next.length);
        if (
          next.thickness !== null &&
          !nextThicknesses.includes(next.thickness)
        ) {
          next.thickness = nextThicknesses[0] ?? null;
        }
      }
      return next;
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value !== null && value !== "unsure" && value !== false) {
        params.set(key, String(value));
      }
    }
    router.push(
      (pathname +
        (params.toString() ? "?" + params.toString() : "#results")) as never,
    );
  }

  const steps = [
    { num: "01", label: "Kích thước" },
    { num: "02", label: "Cảm giác & Ngân sách" },
    { num: "03", label: "Ưu tiên nghỉ ngơi" },
  ];

  return (
    <form id="finder-form" className="finder-wizard" onSubmit={submit}>
      <div className="finder-steps-progress" aria-label="Tiến trình chọn nệm">
        {steps.map((item, idx) => (
          <button
            key={item.num}
            type="button"
            className={
              "finder-step-indicator " +
              (step === idx
                ? "is-active"
                : step > idx
                  ? "is-completed"
                  : "is-upcoming")
            }
            onClick={() => setStep(idx)}
            aria-current={step === idx ? "step" : undefined}
          >
            <span className="finder-step-num">{item.num}</span>
            <span className="finder-step-label">{item.label}</span>
          </button>
        ))}
      </div>

      {step === 0 && (
        <fieldset className="finder-step-content">
          <legend className="finder-step-title">Kích thước bạn đang tìm kiếm</legend>
          <p className="finder-step-subtitle">
            Chọn kích thước giường ngủ hoặc không gian của bạn để thu hẹp các dòng nệm tương thích.
          </p>

          <div className="finder-choice-section">
            <p className="finder-choice-heading">Chiều rộng giường (cm)</p>
            <div className="finder-pills-grid">
              <button
                type="button"
                className={"finder-pill-card " + (state.width === null ? "is-selected" : "")}
                aria-pressed={state.width === null}
                onClick={() => update("width", null)}
              >
                <strong>Tất cả kích thước</strong>
                <small>Khám phá toàn bộ</small>
              </button>
              {widths.map((w) => (
                <button
                  key={w}
                  type="button"
                  className={"finder-pill-card " + (state.width === w ? "is-selected" : "")}
                  aria-pressed={state.width === w}
                  onClick={() => update("width", w)}
                >
                  <strong>{w} cm</strong>
                  <small>{w >= 180 ? "Cỡ lớn" : w >= 160 ? "Cỡ tiêu chuẩn" : "Cỡ nhỏ gọn"}</small>
                </button>
              ))}
            </div>
          </div>

          {currentLengths.length > 1 && (
            <div className="finder-choice-section">
              <p className="finder-choice-heading">Chiều dài (cm)</p>
              <div className="finder-pills-row">
                <button
                  type="button"
                  className={"finder-pill " + (state.length === null ? "is-selected" : "")}
                  aria-pressed={state.length === null}
                  onClick={() => update("length", null)}
                >
                  Tất cả
                </button>
                {currentLengths.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={"finder-pill " + (state.length === l ? "is-selected" : "")}
                    aria-pressed={state.length === l}
                    onClick={() => update("length", l)}
                  >
                    {l} cm
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentThicknesses.length > 1 && (
            <div className="finder-choice-section">
              <p className="finder-choice-heading">Độ dày (cm)</p>
              <div className="finder-pills-row">
                <button
                  type="button"
                  className={"finder-pill " + (state.thickness === null ? "is-selected" : "")}
                  aria-pressed={state.thickness === null}
                  onClick={() => update("thickness", null)}
                >
                  Tất cả
                </button>
                {currentThicknesses.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={"finder-pill " + (state.thickness === t ? "is-selected" : "")}
                    aria-pressed={state.thickness === t}
                    onClick={() => update("thickness", t)}
                  >
                    {t} cm
                  </button>
                ))}
              </div>
            </div>
          )}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="finder-step-content">
          <legend className="finder-step-title">Cảm giác nằm &amp; Mức ngân sách</legend>
          <p className="finder-step-subtitle">
            Cảm giác bạn mong muốn khi ngả lưng mỗi đêm.
          </p>

          <div className="finder-choice-section">
            <p className="finder-choice-heading">Cảm giác nằm ưa thích</p>
            <div className="finder-choice-cards-grid">
              {[
                {
                  value: "soft" as FinderFeel,
                  label: "Êm ái",
                  desc: "Ưu tiên cảm giác mềm hơn khi nằm.",
                },
                {
                  value: "balanced" as FinderFeel,
                  label: "Cân bằng",
                  desc: "Ưu tiên cảm giác nằm ở mức trung hòa.",
                },
                {
                  value: "firm" as FinderFeel,
                  label: "Vững hơn",
                  desc: "Ưu tiên bề mặt có cảm giác chắc hơn.",
                },
                {
                  value: "unsure" as FinderFeel,
                  label: "Chưa chắc / Cần gợi ý",
                  desc: "Khám phá danh sách theo các trường thông tin chung.",
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={"finder-choice-card " + (state.feel === item.value ? "is-selected" : "")}
                  aria-pressed={state.feel === item.value}
                  onClick={() => update("feel", item.value)}
                >
                  <span className="choice-bullet" />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {hasVerifiedPrices && (
            <div className="finder-choice-section">
              <label className="finder-choice-heading" htmlFor="finder-max-price">
                Ngân sách tối đa dự kiến (VND)
              </label>
              <div className="finder-input-wrapper">
                <input
                  id="finder-max-price"
                  type="number"
                  min="1"
                  placeholder="Ví dụ: 30000000"
                  value={state.maxPrice ?? ""}
                  onChange={(event) =>
                    update("maxPrice", event.target.value ? Number(event.target.value) : null)
                  }
                  className="finder-number-input"
                />
              </div>
            </div>
          )}
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="finder-step-content">
          <legend className="finder-step-title">Ưu tiên chính khi nghỉ ngơi</legend>
          <p className="finder-step-subtitle">
            Chọn yếu tố quan trọng nhất đối với giấc ngủ của bạn và gia đình.
          </p>

          <div className="finder-choice-section">
            <div className="finder-choice-cards-grid">
              {[
                {
                  value: "support" as FinderPriority,
                  label: "Ưu tiên nâng đỡ",
                  desc: "Tìm theo trường dữ liệu nâng đỡ đã được công bố.",
                },
                {
                  value: "breathability" as FinderPriority,
                  label: "Ưu tiên độ thoáng",
                  desc: "Tìm theo trường dữ liệu độ thoáng đã được công bố.",
                },
                {
                  value: "motion-isolation" as FinderPriority,
                  label: "Ưu tiên hạn chế truyền chuyển động",
                  desc: "Tìm theo dữ liệu đã được công bố cho tiêu chí này.",
                },
                {
                  value: "unsure" as FinderPriority,
                  label: "Tất cả các tiêu chí",
                  desc: "Hiển thị các dòng nệm theo thông tin tổng hợp.",
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={"finder-choice-card " + (state.priority === item.value ? "is-selected" : "")}
                  aria-pressed={state.priority === item.value}
                  onClick={() => update("priority", item.value)}
                >
                  <span className="choice-bullet" />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="finder-stock-toggle">
            <label className="finder-check-label">
              <input
                type="checkbox"
                checked={state.inStock}
                onChange={(event) => update("inStock", event.target.checked)}
              />
              <span>Chỉ hiển thị các biến thể hiện còn hàng</span>
            </label>
          </div>
        </fieldset>
      )}

      <div className="finder-actions">
        {step > 0 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setStep((value) => value - 1)}
          >
            ← Quay lại
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => setStep((value) => value + 1)}
          >
            Tiếp theo →
          </button>
        ) : (
          <button type="submit" className="button button-primary">
            Xem kết quả gợi ý
          </button>
        )}
      </div>
    </form>
  );
}
