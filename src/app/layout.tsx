import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BusCard | Business Card Generator",
  description: "Create stunning business cards in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Provider>
            {children}
            <Toaster position="bottom-right" />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
