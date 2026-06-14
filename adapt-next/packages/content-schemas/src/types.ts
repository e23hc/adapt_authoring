// Shared, framework-agnostic types for the content tree, schemas, and published output.
// This package must stay dependency-light (no React, Next, or Prisma).

/** Widget kinds the schema-driven form can render (ported from the legacy `inputType` taxonomy). */
export type WidgetKind =
  | "text"
  | "textarea"
  | "richtext"
  | "displayTitle"
  | "number"
  | "boolean"
  | "select"
  | "asset"
  | "codeeditor"
  | "tags"
  | "list"
  | "object";

/** UI hint carried on a JSON Schema property under the `x-ui` extension key. */
export interface UiHint {
  widget?: WidgetKind;
  /** Options for `select` widgets (falls back to JSON Schema `enum`). */
  options?: Array<{ value: string | number | boolean; label?: string }>;
  /** For `list` widgets: which child field to use as each item's summary label. */
  itemLabel?: string;
  collapsible?: boolean;
  placeholder?: string;
  help?: string;
  /** Hide from the editor (legacy `editorOnly`). */
  hidden?: boolean;
}

/** The subset of JSON Schema we author and interpret. */
export interface PropSchema {
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array";
  title?: string;
  description?: string;
  default?: unknown;
  enum?: Array<string | number>;
  properties?: Record<string, PropSchema>;
  required?: string[];
  items?: PropSchema;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean;
  /** Legacy grouping flag: render under the "Settings" fieldset. */
  isSetting?: boolean;
  "x-ui"?: UiHint;
}

export interface ComponentSchema extends PropSchema {
  $schema?: string;
  $id?: string;
  type: "object";
  properties: Record<string, PropSchema>;
}

export interface ComponentTypeMeta {
  /** The `_component` key — source of truth for render + validation, e.g. "mcq". */
  key: string;
  /** Export package name (used by the future Adapt exporter), e.g. "adapt-contrib-mcq". */
  name: string;
  displayName: string;
  /** lucide-react icon name. */
  icon?: string;
}

export interface ComponentTypeEntry extends ComponentTypeMeta {
  schema: ComponentSchema;
  defaults: () => Record<string, unknown>;
}

export interface ComponentSchemaRegistry {
  list(): ComponentTypeMeta[];
  has(key: string): boolean;
  get(key: string): ComponentTypeEntry | undefined;
  getSchema(key: string): ComponentSchema | undefined;
  getDefaults(key: string): Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Content tree (domain) types
// ---------------------------------------------------------------------------

export type ContentObjectKind = "menu" | "page";
export type ComponentLayout = "full" | "left" | "right";

// ---------------------------------------------------------------------------
// Published types — the JSON shape consumed by the portable renderer.
// Kept close to the legacy Adapt JSON so a future SCORM exporter is a clean transform.
// ---------------------------------------------------------------------------

export interface PublishedComponent {
  _id: string;
  _component: string;
  _layout: ComponentLayout;
  title?: string;
  displayTitle?: string;
  body?: string;
  _isAvailable: boolean;
  properties: Record<string, unknown>;
}

export interface PublishedBlock {
  _id: string;
  title?: string;
  displayTitle?: string;
  body?: string;
  _classes?: string;
  _isAvailable: boolean;
  components: PublishedComponent[];
}

export interface PublishedArticle {
  _id: string;
  title?: string;
  displayTitle?: string;
  body?: string;
  _classes?: string;
  _isAvailable: boolean;
  blocks: PublishedBlock[];
}

export interface PublishedPage {
  _id: string;
  _kind: ContentObjectKind;
  title?: string;
  displayTitle?: string;
  body?: string;
  _isAvailable: boolean;
  articles: PublishedArticle[];
  /** Sub-pages/menus nested under a menu content object. */
  children: PublishedPage[];
}

export interface PublishedCourseConfig {
  _theme: string;
  _menu: string;
  _defaultLanguage: string;
  _defaultDirection: "ltr" | "rtl";
}

export interface PublishedCourse {
  _id: string;
  title: string;
  displayTitle?: string;
  body?: string;
  config: PublishedCourseConfig;
  pages: PublishedPage[];
}
