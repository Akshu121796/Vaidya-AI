import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Vaidya.ai | Next-Gen AI Healthcare Platform",
  description: "Experience premium, personalized medical assistance, health locking, and clinical search built on Apple Health & Perplexity aesthetics.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden">
        <Providers>
          <div className="flex min-h-screen flex-col md:flex-row bg-[#090d16]/70">
            {/* Left Sidebar on Desktop / Bottom Tab Bar on Mobile */}
            <Sidebar />
            
            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
              {/* Header on mobile for logo/profile */}
              <Navbar />
              
              <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full focus:outline-none">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
