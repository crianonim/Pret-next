import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import icon from "../assets/favicon.png";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pret-5-A-Day",
  description: "So boyfriends can share a sub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="apple-touch-icon" href={icon.src}></link>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
