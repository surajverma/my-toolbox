import type { Metadata } from 'next';

import { Poppins, Lexend_Deca } from 'next/font/google'; // Import Lexend_Deca
import './globals.css';

// Configure the Poppins font for body text
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins', // CSS variable for body font
  display: 'swap',
});

// Configure the Lexend Deca font for headings
const lexend = Lexend_Deca({
  weight: ['400', '700'], // Weights for regular and bold headings
  subsets: ['latin'],
  variable: '--font-lexend', // CSS variable for heading font
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'My ToolBox - Free Privacy-Focused Online Tools',
  description: 'A collection of simple, free, and privacy-focused online tools that work entirely in your browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${poppins.variable} ${lexend.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
