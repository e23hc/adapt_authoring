"use client";
import type { ComponentRendererProps } from "../registry";
import { useRenderer } from "../context";

interface MediaProps {
  _media?: { source?: string; poster?: string; type?: "video" | "audio" };
}

export function Media({ displayTitle, properties }: ComponentRendererProps<MediaProps>) {
  const { assetResolver } = useRenderer();
  const m = properties._media ?? {};
  return (
    <div className="an-media">
      {displayTitle ? <h3 className="an-component__title" dangerouslySetInnerHTML={{ __html: displayTitle }} /> : null}
      {!m.source ? (
        <div className="an-placeholder">No media source</div>
      ) : m.type === "audio" ? (
        <audio className="an-media__audio" controls src={assetResolver(m.source)} />
      ) : (
        <video
          className="an-media__video"
          controls
          poster={m.poster ? assetResolver(m.poster) : undefined}
          src={assetResolver(m.source)}
        />
      )}
    </div>
  );
}
