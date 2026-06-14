import type { PublishedPage } from "@adapt-next/content-schemas";
import { ArticleRenderer } from "./ArticleRenderer";

export function PageRenderer({ node }: { node: PublishedPage }) {
  if (!node._isAvailable) return null;
  return (
    <>
      <article className={`an-page an-page--${node._kind}`}>
        <header className="an-page__header">
          {node.displayTitle || node.title ? (
            <h1 className="an-page__title" dangerouslySetInnerHTML={{ __html: node.displayTitle || node.title || "" }} />
          ) : null}
          {node.body ? <div className="an-prose" dangerouslySetInnerHTML={{ __html: node.body }} /> : null}
        </header>
        {node.articles.map((a) => (
          <ArticleRenderer key={a._id} node={a} />
        ))}
      </article>
      {node.children.map((child) => (
        <PageRenderer key={child._id} node={child} />
      ))}
    </>
  );
}
