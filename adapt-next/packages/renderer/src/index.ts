// Portable renderer entry. Depends only on React (peer) + @adapt-next/content-schemas.
export { CourseRenderer } from "./CourseRenderer";
export { PageRenderer } from "./PageRenderer";
export { ArticleRenderer } from "./ArticleRenderer";
export { BlockRenderer } from "./BlockRenderer";
export { ComponentRenderer } from "./ComponentRenderer";
export {
  RendererProvider,
  useRenderer,
  type RendererContextValue,
  type RendererMode,
  type CompletionResult,
} from "./context";
export {
  registerComponent,
  getComponentRenderer,
  listRegistered,
  type ComponentRenderer as ComponentRendererType,
  type ComponentRendererProps,
} from "./registry";

// Re-export the published JSON types consumers feed in.
export type {
  PublishedCourse,
  PublishedPage,
  PublishedArticle,
  PublishedBlock,
  PublishedComponent,
  PublishedCourseConfig,
} from "@adapt-next/content-schemas";
