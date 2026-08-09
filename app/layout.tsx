import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Interview Agent - ABTalks Hackathon',
  description: 'Adaptive AI Technical Interviewer powered by Breeth AI Memory & Intent Layer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full overflow-x-hidden dark">
      <body className="h-full w-full overflow-x-hidden bg-slate-950 text-white antialiased m-0 p-0">
        {children}
      </body>
    </html>
  );
}
