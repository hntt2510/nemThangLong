import { isUiShowcaseMode } from "@/lib/ui-showcase";

export function UiShowcaseBadge() {
  if (!isUiShowcaseMode()) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 99999,
        background: "rgba(24, 38, 30, 0.92)",
        color: "#c8a876",
        border: "1px solid rgba(200, 168, 118, 0.4)",
        borderRadius: "999px",
        padding: "6px 14px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        backdropFilter: "blur(8px)",
        pointerEvents: "none",
        userSelect: "none",
        fontFamily: "var(--font-ui)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#c8a876",
          display: "inline-block",
        }}
      />
      Dữ liệu trình diễn · UI Preview
    </div>
  );
}
