import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where Is My Stuff — Family Household Memory",
  description: "Smooth 5-second capture, humanlike conversational retrieval, put-it-back timers, and family sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

