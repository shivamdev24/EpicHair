import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css"; 

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "EpicHair - Professional Haircare and Grooming Services",
  description: "Discover EpicHair Salon, your go-to destination for expert haircuts, styling, coloring, and grooming. Book an appointment today for a personalized haircare experience tailored to your unique needs.",
  keywords: "EpicHair, haircuts, haircare, grooming, hair styling, hair coloring, professional salon, personalized haircare",
  viewport: "width=device-width, initial-scale=1.0",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        
        {children}
      </body>
    </html>
  );
}
