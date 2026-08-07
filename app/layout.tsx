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
    <html lang="en" className="dark">
      <body className="bg-[#0a0d14] text-slate-100 min-h-screen">
        <div className="relative min-h-screen flex flex-col justify-between">
          <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-teal-500/20">
                  IA
                </div>
                <div>
                  <span className="font-extrabold text-slate-100 text-base tracking-tight">The Interview Agent</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                    Breeth AI Memory Engine
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                ABTalks Hackathon 2026
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>

          <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
            The Interview Agent &bull; Powered by Next.js, Breeth AI REST API & Gemini 1.5
          </footer>
        </div>
      </body>
    </html>
  );
}
