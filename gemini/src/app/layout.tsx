import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Import Poppins
import './globals.css';

// Configure the Poppins font
const poppins = Poppins({
  weight: ['400', '600', '700'], // Specify the weights you want to use
  subsets: ['latin'],
  variable: '--font-poppins', // Use a CSS variable
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
      {/* Apply the font variable to the body */}
      <body className={`${poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
