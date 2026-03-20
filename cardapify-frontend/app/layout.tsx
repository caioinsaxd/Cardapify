import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardapify",
  description: "Cardapify - Digital Menu SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
