"use client";
import type { PublishedComponent } from "@adapt-next/content-schemas";
import { getComponentRenderer } from "./registry";

export function ComponentRenderer({ node }: { node: PublishedComponent }) {
  if (!node._isAvailable) return null;
  const Component = getComponentRenderer(node._component);
  if (!Component) {
    return <div className="an-component an-component--unknown">Unknown component: {node._component}</div>;
  }
  return (
    <div className={`an-component an-component--${node._component} an-layout--${node._layout}`}>
      <Component
        id={node._id}
        title={node.title}
        displayTitle={node.displayTitle}
        body={node.body}
        properties={node.properties}
      />
    </div>
  );
}
