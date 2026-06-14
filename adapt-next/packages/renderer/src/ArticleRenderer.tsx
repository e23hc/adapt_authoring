import type { PublishedArticle } from "@adapt-next/content-schemas";
import { BlockRenderer } from "./BlockRenderer";

export function ArticleRenderer({ node }: { node: PublishedArticle }) {
  if (!node._isAvailable) return null;
  return (
    <section className={`an-article ${node._classes ?? ""}`}>
      {node.displayTitle ? (
        <h2 className="an-article__title" dangerouslySetInnerHTML={{ __html: node.displayTitle }} />
      ) : null}
      {node.body ? <div className="an-prose" dangerouslySetInnerHTML={{ __html: node.body }} /> : null}
      {node.blocks.map((b) => (
        <BlockRenderer key={b._id} node={b} />
      ))}
    </section>
  );
}
