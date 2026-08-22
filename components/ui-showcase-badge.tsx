import { isUiShowcaseMode } from "@/lib/ui-showcase";

export function UiShowcaseBadge() {
  if (!isUiShowcaseMode()) return null;
  return (
    <div className="ui-showcase-badge" role="status" aria-label="Chế độ dữ liệu trình diễn giao diện">
      <span className="ui-showcase-badge-dot" />
      <span className="ui-showcase-badge-text-desktop">Dữ liệu trình diễn · UI Preview</span>
      <span className="ui-showcase-badge-text-mobile">UI Preview</span>
    </div>
  );
}
