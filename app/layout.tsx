import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import PageTitleProvider from "../providers/PageTitleProvider";
import { AuthProvider } from "../providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TotallyIndian - Admin Portal",
  description: "TotallyIndian Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <PageTitleProvider>{children}</PageTitleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
