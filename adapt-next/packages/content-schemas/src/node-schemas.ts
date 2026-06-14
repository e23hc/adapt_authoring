// Base editable-field schemas for the structural content nodes and course config.
// The property panel composes these with a component's `properties` schema (from the registry).
import type { PropSchema } from "./types";

const title: PropSchema = {
  type: "string",
  title: "Title",
  default: "",
  "x-ui": { widget: "text" },
};
const displayTitle: PropSchema = {
  type: "string",
  title: "Display title",
  default: "",
  "x-ui": { widget: "displayTitle", help: "Shown to learners; basic formatting allowed." },
};
const body: PropSchema = {
  type: "string",
  title: "Body",
  default: "",
  "x-ui": { widget: "richtext" },
};
const classes: PropSchema = {
  type: "string",
  title: "Classes",
  default: "",
  isSetting: true,
  "x-ui": { widget: "text", help: "Space-separated CSS classes." },
};
const isOptional: PropSchema = {
  type: "boolean",
  title: "Optional",
  default: false,
  isSetting: true,
  "x-ui": { widget: "boolean" },
};
const isAvailable: PropSchema = {
  type: "boolean",
  title: "Available",
  default: true,
  isSetting: true,
  "x-ui": { widget: "boolean", help: "Uncheck to hide from learners." },
};

// Field keys intentionally match the API/DB names so a form value maps directly to a PATCH body.
function baseFields(): Record<string, PropSchema> {
  return { title, displayTitle, body, classes, isOptional, isAvailable };
}

export const contentObjectSchema: PropSchema = {
  type: "object",
  properties: { ...baseFields() },
};

export const articleSchema: PropSchema = {
  type: "object",
  properties: { ...baseFields() },
};

export const blockSchema: PropSchema = {
  type: "object",
  properties: { ...baseFields() },
};

export const componentBaseSchema: PropSchema = {
  type: "object",
  properties: {
    ...baseFields(),
    layout: {
      type: "string",
      title: "Layout",
      default: "full",
      enum: ["full", "left", "right"],
      isSetting: true,
      "x-ui": { widget: "select" },
    },
  },
};

export const courseSchema: PropSchema = {
  type: "object",
  properties: { title, displayTitle, body },
};

export const courseConfigSchema: PropSchema = {
  type: "object",
  properties: {
    theme: { type: "string", title: "Theme", default: "adapt-contrib-vanilla", "x-ui": { widget: "text" } },
    menu: { type: "string", title: "Menu", default: "adapt-contrib-boxMenu", "x-ui": { widget: "text" } },
    defaultLanguage: { type: "string", title: "Default language", default: "en", "x-ui": { widget: "text" } },
    defaultDirection: {
      type: "string",
      title: "Text direction",
      default: "ltr",
      enum: ["ltr", "rtl"],
      "x-ui": { widget: "select" },
    },
  },
};

/** Editable base schema by node type (the editor fetches these via /api/schemas). */
export const nodeSchemas: Record<string, PropSchema> = {
  contentobject: contentObjectSchema,
  article: articleSchema,
  block: blockSchema,
  component: componentBaseSchema,
  course: courseSchema,
  courseconfig: courseConfigSchema,
};
