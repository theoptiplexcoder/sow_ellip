import './global.css';
import { Space_Grotesk, Manrope } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'SOW Platform — The no-fuss system of record for every statement of work',
  description:
    'Draft, route, and approve statements of work in one structured record. Catch scope drift while it is still cheap to change, and keep a permanent audit trail for every SOW.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  )
}
