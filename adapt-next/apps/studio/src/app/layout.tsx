import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "@adapt-next/renderer/styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Adapt Next Studio",
  description: "Schema-driven course authoring tool",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
