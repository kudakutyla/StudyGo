import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StudyGo | Stay organized. Stay ahead.",
  description: "StudyGo helps students manage assignments, deadlines, and priorities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
