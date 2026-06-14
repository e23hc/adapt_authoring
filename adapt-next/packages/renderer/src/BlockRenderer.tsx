import type { PublishedBlock } from "@adapt-next/content-schemas";
import { ComponentRenderer } from "./ComponentRenderer";

export function BlockRenderer({ node }: { node: PublishedBlock }) {
  if (!node._isAvailable) return null;
  return (
    <div className={`an-block ${node._classes ?? ""}`}>
      {node.displayTitle ? (
        <h2 className="an-block__title" dangerouslySetInnerHTML={{ __html: node.displayTitle }} />
      ) : null}
      {node.body ? <div className="an-prose" dangerouslySetInnerHTML={{ __html: node.body }} /> : null}
      <div className="an-block__components">
        {node.components.map((c) => (
          <ComponentRenderer key={c._id} node={c} />
        ))}
      </div>
    </div>
  );
}
