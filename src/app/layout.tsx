import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Artha — Your Financial Story, Told Forward",
  description:
    "Personalized financial coaching powered by behavioral intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased bg-artha-bg text-artha-text overflow-x-hidden`}
      >
        <div className="max-w-md mx-auto min-h-screen relative" style={{ overflowX: "clip" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
