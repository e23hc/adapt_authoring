import type {
  PublishedArticle,
  PublishedBlock,
  PublishedComponent,
  PublishedCourse,
  PublishedPage,
} from "@adapt-next/content-schemas";
import { getCourseTree, type EditorContentObject } from "./tree.service";

// The forward-compatible seam for a future Adapt SCORM exporter: assemble the renderer JSON here,
// then a later exporter applies the legacy sanitizeCourseJSON transform on top of this shape.
export async function getPublishedCourse(courseId: string): Promise<PublishedCourse> {
  const { course, contentObjects } = await getCourseTree(courseId);

  const mapPage = (co: EditorContentObject): PublishedPage => ({
    _id: co.id,
    _kind: co.kind,
    title: co.title,
    displayTitle: co.displayTitle ?? undefined,
    body: co.body ?? undefined,
    _isAvailable: co.isAvailable,
    articles: co.articles.map(
      (a): PublishedArticle => ({
        _id: a.id,
        title: a.title,
        displayTitle: a.displayTitle ?? undefined,
        body: a.body ?? undefined,
        _classes: a.classes,
        _isAvailable: a.isAvailable,
        blocks: a.blocks.map(
          (b): PublishedBlock => ({
            _id: b.id,
            title: b.title,
            displayTitle: b.displayTitle ?? undefined,
            body: b.body ?? undefined,
            _classes: b.classes,
            _isAvailable: b.isAvailable,
            components: b.components.map(
              (c): PublishedComponent => ({
                _id: c.id,
                _component: c.component,
                _layout: c.layout,
                title: c.title,
                displayTitle: c.displayTitle ?? undefined,
                body: c.body ?? undefined,
                _isAvailable: c.isAvailable,
                properties: (c.properties ?? {}) as Record<string, unknown>,
              }),
            ),
          }),
        ),
      }),
    ),
    children: co.children.map(mapPage),
  });

  return {
    _id: course.id,
    title: course.title,
    displayTitle: course.displayTitle ?? undefined,
    body: course.body ?? undefined,
    config: {
      _theme: course.config?.theme ?? "adapt-contrib-vanilla",
      _menu: course.config?.menu ?? "adapt-contrib-boxMenu",
      _defaultLanguage: course.config?.defaultLanguage ?? "en",
      _defaultDirection: (course.config?.defaultDirection ?? "ltr") as "ltr" | "rtl",
    },
    pages: contentObjects.map(mapPage),
  };
}
