"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function AdminDrawer({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!open || !root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(root.current.querySelector(".ops-drawer-panel"), { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: .2, ease: "power1.out" });
  }, { scope: root, dependencies: [open], revertOnUpdate: true });
  if (!open) return null;
  return <div className="ops-drawer" ref={root} role="presentation"><button className="ops-drawer-backdrop" aria-label="Đóng panel" onClick={onClose} /><aside className="ops-drawer-panel" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Đóng">×</button></header><div className="ops-drawer-body">{children}</div></aside></div>;
}
