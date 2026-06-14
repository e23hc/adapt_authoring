// Component-type registry. Source of truth = the filesystem JSON Schemas in ./components.
// Adding a component type = adding a folder here, no editor code changes.
import type {
  ComponentSchema,
  ComponentSchemaRegistry,
  ComponentTypeEntry,
  ComponentTypeMeta,
} from "./types";

import textSchema from "./components/text/schema.json";
import textDefaults from "./components/text/defaults.json";
import graphicSchema from "./components/graphic/schema.json";
import graphicDefaults from "./components/graphic/defaults.json";
import mediaSchema from "./components/media/schema.json";
import mediaDefaults from "./components/media/defaults.json";
import mcqSchema from "./components/mcq/schema.json";
import mcqDefaults from "./components/mcq/defaults.json";
import accordionSchema from "./components/accordion/schema.json";
import accordionDefaults from "./components/accordion/defaults.json";

interface ManifestEntry {
  key: string;
  name: string;
  displayName: string;
  icon: string;
  schema: unknown;
  defaults: unknown;
}

const manifest: ManifestEntry[] = [
  { key: "text", name: "adapt-contrib-text", displayName: "Text", icon: "Type", schema: textSchema, defaults: textDefaults },
  { key: "graphic", name: "adapt-contrib-graphic", displayName: "Graphic", icon: "Image", schema: graphicSchema, defaults: graphicDefaults },
  { key: "media", name: "adapt-contrib-media", displayName: "Media", icon: "Play", schema: mediaSchema, defaults: mediaDefaults },
  { key: "mcq", name: "adapt-contrib-mcq", displayName: "Multiple Choice", icon: "ListChecks", schema: mcqSchema, defaults: mcqDefaults },
  { key: "accordion", name: "adapt-contrib-accordion", displayName: "Accordion", icon: "ChevronsDownUp", schema: accordionSchema, defaults: accordionDefaults },
];

const entries = new Map<string, ComponentTypeEntry>();
for (const m of manifest) {
  entries.set(m.key, {
    key: m.key,
    name: m.name,
    displayName: m.displayName,
    icon: m.icon,
    schema: m.schema as ComponentSchema,
    defaults: () => structuredClone(m.defaults) as Record<string, unknown>,
  });
}

export const registry: ComponentSchemaRegistry = {
  list(): ComponentTypeMeta[] {
    return [...entries.values()].map(({ key, name, displayName, icon }) => ({ key, name, displayName, icon }));
  },
  has(key: string): boolean {
    return entries.has(key);
  },
  get(key: string): ComponentTypeEntry | undefined {
    return entries.get(key);
  },
  getSchema(key: string): ComponentSchema | undefined {
    return entries.get(key)?.schema;
  },
  getDefaults(key: string): Record<string, unknown> {
    const entry = entries.get(key);
    if (!entry) throw new Error(`Unknown component type: ${key}`);
    return entry.defaults();
  },
};
