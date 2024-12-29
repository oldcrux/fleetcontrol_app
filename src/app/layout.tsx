import type { Metadata } from "next";
import { lusitana, montserrat, roboto } from "@/app/ui/fonts";
import "./globals.css";
import GoogleMapProvider from "./google-map-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Fleet Control",
  description: "OldCrux Fleet Control",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${roboto.className}  antialiased`}>
      <div
          className={`${montserrat.className} fixed top-2 left-2 p-1 text-xs text-gray-300 flex justify-center sm:justify-end`}
        >
          <a href="https://oldcrux.com/" className="hover:text-blue-500">
          {'<'} oldcrux.com
          </a>
        </div>

        <SessionProvider session={session}>
          <GoogleMapProvider>{children}</GoogleMapProvider>
        </SessionProvider>
        <div
          className={`${montserrat.className} fixed bottom-0 left-0 right-0 p-1 text-xs text-gray-600 flex justify-center sm:justify-end`}
        >
          © {new Date().getFullYear()} OldCrux Pvt Ltd. All rights reserved.
        </div>
      </body>
    </html>
  );
}
