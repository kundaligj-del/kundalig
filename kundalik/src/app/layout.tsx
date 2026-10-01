import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kundalik — dars jadvaling",
  description: "Darslaring va maktab rejalaring uchun quvnoq kundalik.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
