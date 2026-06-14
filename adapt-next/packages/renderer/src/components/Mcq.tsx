"use client";
import { useState } from "react";
import type { ComponentRendererProps } from "../registry";
import { useRenderer } from "../context";

interface McqItem {
  text: string;
  _shouldBeSelected?: boolean;
  feedback?: string;
}
interface McqProps {
  instruction?: string;
  _selectable?: number;
  _items?: McqItem[];
  _feedback?: { correct?: string; incorrect?: string };
}

export function Mcq({ id, displayTitle, properties }: ComponentRendererProps<McqProps>) {
  const { instruction, _selectable = 1, _items = [], _feedback } = properties;
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const { onComplete } = useRenderer();

  const single = _selectable === 1;

  const toggle = (i: number) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        if (single) next.clear();
        next.add(i);
      }
      return next;
    });
  };

  const isCorrect = _items.every((it, i) => Boolean(it._shouldBeSelected) === selected.has(i));

  const submit = () => {
    setSubmitted(true);
    onComplete?.(id, { correct: isCorrect });
  };
  const reset = () => {
    setSubmitted(false);
    setSelected(new Set());
  };

  return (
    <div className="an-mcq">
      {displayTitle ? <h3 className="an-component__title" dangerouslySetInnerHTML={{ __html: displayTitle }} /> : null}
      {instruction ? <p className="an-mcq__instruction">{instruction}</p> : null}
      <ul className="an-mcq__items" role="group">
        {_items.map((it, i) => {
          const state = submitted ? (it._shouldBeSelected ? "correct" : selected.has(i) ? "incorrect" : "") : "";
          return (
            <li key={i} className="an-mcq__item" data-state={state}>
              <label>
                <input
                  type={single ? "radio" : "checkbox"}
                  name={`mcq-${id}`}
                  checked={selected.has(i)}
                  disabled={submitted}
                  onChange={() => toggle(i)}
                />
                <span>{it.text}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {!submitted ? (
        <button className="an-btn" disabled={selected.size === 0} onClick={submit}>
          Submit
        </button>
      ) : (
        <div className="an-mcq__feedback" data-correct={isCorrect}>
          <p>{(isCorrect ? _feedback?.correct : _feedback?.incorrect) ?? (isCorrect ? "Correct" : "Try again")}</p>
          <button className="an-btn" onClick={reset}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
