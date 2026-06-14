import type { AnyNode, ContentObjectNode, EditorTree, NodeType } from "@/lib/types";

export function* iterateContentObjects(cos: ContentObjectNode[]): Generator<ContentObjectNode> {
  for (const co of cos) {
    yield co;
    yield* iterateContentObjects(co.children);
  }
}

export function findNode(tree: EditorTree, type: NodeType, id: string): AnyNode | null {
  for (const co of iterateContentObjects(tree.contentObjects)) {
    if (type === "contentobject" && co.id === id) return co;
    for (const article of co.articles) {
      if (type === "article" && article.id === id) return article;
      for (const block of article.blocks) {
        if (type === "block" && block.id === id) return block;
        for (const component of block.components) {
          if (type === "component" && component.id === id) return component;
        }
      }
    }
  }
  return null;
}

export function findPage(tree: EditorTree, pageId: string): ContentObjectNode | null {
  for (const co of iterateContentObjects(tree.contentObjects)) {
    if (co.id === pageId) return co;
  }
  return null;
}
