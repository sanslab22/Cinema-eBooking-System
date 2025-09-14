import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cinema E-Booking App",
  description: "Cinema E-Booking App built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
