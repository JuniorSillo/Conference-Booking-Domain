import type { Metadata } from "next";
import "./globals.css";
import ClientNavbar from "../components/ClientNavbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Conference Booking System",
  description: "Secure booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <ClientNavbar/>
          <main className="flex-grow p-4">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}