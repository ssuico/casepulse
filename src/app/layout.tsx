import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css"
import { AppLayout } from "@/components/app-layout";
import { UserProvider } from "@/contexts/user-context";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Case Pulse - Amazon Case Monitoring",
  description: "Real-time monitoring tool for Amazon cases across 1P, 2P, and 3P accounts. Track, manage, and analyze case data with intuitive dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        <UserProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </UserProvider>
      </body>
    </html>
  );
}
