"use client";
import type { ComponentRendererProps } from "../registry";
import { useRenderer } from "../context";

interface GraphicProps {
  _graphic?: { src?: string; alt?: string; attribution?: string };
}

export function Graphic({ displayTitle, body, properties }: ComponentRendererProps<GraphicProps>) {
  const { assetResolver } = useRenderer();
  const g = properties._graphic ?? {};
  return (
    <figure className="an-graphic">
      {displayTitle ? <h3 className="an-component__title" dangerouslySetInnerHTML={{ __html: displayTitle }} /> : null}
      {g.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="an-graphic__img" src={assetResolver(g.src)} alt={g.alt ?? ""} />
      ) : (
        <div className="an-placeholder">No image selected</div>
      )}
      {g.attribution ? <figcaption className="an-graphic__attribution">{g.attribution}</figcaption> : null}
      {body ? <div className="an-prose" dangerouslySetInnerHTML={{ __html: body }} /> : null}
    </figure>
  );
}
