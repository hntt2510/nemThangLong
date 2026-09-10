"use client";

import { useId, useState } from "react";

type Item = { question: string; answer: string };

export function HomeFaq({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const id = useId();

  return (
    <div>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${id}-${index}`;
        return (
          <article key={item.question}>
            <h3>
              <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenIndex(open ? null : index)}>
                <span>{item.question}</span><b aria-hidden="true">{open ? "−" : "+"}</b>
              </button>
            </h3>
            <div id={panelId} className={open ? "is-open" : ""} aria-hidden={!open}><p>{item.answer}</p></div>
          </article>
        );
      })}
    </div>
  );
}
