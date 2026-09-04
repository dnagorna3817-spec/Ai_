import type { Metadata } from "next";
import "./globals.css";
import { WorkforceProvider } from "@/components/workforce-state";

export const metadata: Metadata = {
  title: "AI Workforce",
  description: "The AI team that works for your business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><WorkforceProvider>{children}</WorkforceProvider></body>
    </html>
  );
}
