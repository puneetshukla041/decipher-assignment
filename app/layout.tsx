import type { Metadata } from "next";
import "./globals.css";
import { FinancialProvider } from "@/context/FinancialContext";

export const metadata: Metadata = {
  title: "Financial Explorer",
  description: "SEC EDGAR Financial Data Explorer",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Add suppressHydrationWarning right here */}
      <body className="bg-gray-50 antialiased text-gray-900 font-sans" suppressHydrationWarning>
        <FinancialProvider>
          {children}
        </FinancialProvider>
      </body>
    </html>
  );
}