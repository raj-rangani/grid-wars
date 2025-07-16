import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grid Wars: Tic Tac Toe",
  description: "Tic Tac Toe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
