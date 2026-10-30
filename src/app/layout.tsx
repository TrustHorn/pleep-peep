import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "pleep·peep — от наблюдений к идеям",
  description: "Рабочее пространство для анализа контента и создания новых идей. Локальный UI-прототип.",
  icons: { icon: "/pleep.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="antialiased" data-scroll-behavior="smooth">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
