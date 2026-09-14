import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaimReady — Policy-to-Claim Engine",
  description: "Synthetic ACCT437 claim-policy prototype."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
