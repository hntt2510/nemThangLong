"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ComparePicker({ selected, options }: { selected: string[]; options: Array<{ slug: string; name: string }> }) {
  const router = useRouter();
  const [items, setItems] = useState(selected);
  function toggle(slug: string) {
    setItems((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 3 ? [...current, slug] : current);
  }
  return <div className="compare-picker" aria-label="Chọn dòng nệm để so sánh">
    {options.map((option) => <label key={option.slug}><input type="checkbox" checked={items.includes(option.slug)} onChange={() => toggle(option.slug)} /> <span>{option.name}</span></label>)}
    <button className="button button-primary" type="button" disabled={items.length < 2} onClick={() => router.push(("/so-sanh?items=" + items.join(",")) as never)}>Cập nhật so sánh</button>
  </div>;
}
