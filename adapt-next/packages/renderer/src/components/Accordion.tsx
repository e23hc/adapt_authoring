"use client";
import { useState } from "react";
import type { ComponentRendererProps } from "../registry";

interface AccordionItem {
  title: string;
  body?: string;
}
interface AccordionProps {
  _items?: AccordionItem[];
}

export function Accordion({ displayTitle, properties }: ComponentRendererProps<AccordionProps>) {
  const items = properties._items ?? [];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="an-accordion">
      {displayTitle ? <h3 className="an-component__title" dangerouslySetInnerHTML={{ __html: displayTitle }} /> : null}
      {items.map((it, i) => (
        <div key={i} className="an-accordion__item">
          <button
            className="an-accordion__header"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {it.title}
          </button>
          {open === i && it.body ? (
            <div className="an-accordion__body an-prose" dangerouslySetInnerHTML={{ __html: it.body }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
