import './global.css';
import '@eigenpal/docx-editor-react/styles.css';
import { Geist, Plus_Jakarta_Sans } from 'next/font/google';
import { cn, TooltipProvider } from '@sow-platform/ui';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  title:
    'SOW Platform — Statement of Work approvals that move as fast as your business',
  description:
    'Create, collaborate, negotiate, approve and sign Statements of Work in one intelligent workspace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('font-sans', geist.variable, plusJakarta.variable)}
      suppressHydrationWarning
    >
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
