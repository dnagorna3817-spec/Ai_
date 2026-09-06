import type { Metadata } from "next";
import "./globals.css";
import { WorkforceProvider } from "@/components/workforce-state";

export const metadata: Metadata = {
  title: "AI-команда",
  description: "AI-команда, яка працює для вашого бізнесу.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body><WorkforceProvider>{children}</WorkforceProvider></body>
    </html>
  );
}
