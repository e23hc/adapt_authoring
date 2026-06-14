import type { ComponentType } from "react";

export interface ComponentRendererProps<P = Record<string, unknown>> {
  id: string;
  title?: string;
  displayTitle?: string;
  body?: string;
  properties: P;
}

// `any` here keeps the registry permissive: a component typed for its own props
// (e.g. McqProps) can still be registered under the generic renderer type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentRenderer = ComponentType<ComponentRendererProps<any>>;

const registry = new Map<string, ComponentRenderer>();

export function registerComponent(key: string, component: ComponentRenderer): void {
  registry.set(key, component);
}

export function getComponentRenderer(key: string): ComponentRenderer | undefined {
  return registry.get(key);
}

export function listRegistered(): string[] {
  return [...registry.keys()];
}
