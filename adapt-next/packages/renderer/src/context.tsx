"use client";
import { createContext, useContext, type ReactNode } from "react";

export type RendererMode = "preview" | "live";

export interface CompletionResult {
  correct: boolean;
}

/** The single seam the host platform implements when it embeds the renderer. */
export interface RendererContextValue {
  mode: RendererMode;
  /** Resolve an asset id or URL to a final URL. Default: identity. */
  assetResolver: (srcOrId: string) => string;
  onComplete?: (componentId: string, result: CompletionResult) => void;
  onNavigate?: (pageId: string) => void;
}

const defaultValue: RendererContextValue = {
  mode: "live",
  assetResolver: (s) => s,
};

const RendererContext = createContext<RendererContextValue>(defaultValue);

export function RendererProvider({
  value,
  children,
}: {
  value?: Partial<RendererContextValue>;
  children: ReactNode;
}) {
  return <RendererContext.Provider value={{ ...defaultValue, ...value }}>{children}</RendererContext.Provider>;
}

export function useRenderer(): RendererContextValue {
  return useContext(RendererContext);
}
