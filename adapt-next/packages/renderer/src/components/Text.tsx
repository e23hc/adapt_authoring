"use client";
import type { ComponentRendererProps } from "../registry";

export function Text({ displayTitle, body }: ComponentRendererProps) {
  return (
    <div className="an-text">
      {displayTitle ? (
        <h3 className="an-component__title" dangerouslySetInnerHTML={{ __html: displayTitle }} />
      ) : null}
      {body ? <div className="an-prose" dangerouslySetInnerHTML={{ __html: body }} /> : null}
    </div>
  );
}
