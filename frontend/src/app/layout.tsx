import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./components/providers";

// KNUST Pulse Platform Layout
export const metadata: Metadata = {
  title: "KNUST Pulse — The voice of campus life",
  description: "Campus social platform for KNUST students, staff, and administrators. Share campus life, connect with communities, and stay informed.",
  keywords: "KNUST, campus, social, student, Ghana",
};

// Inline script: reads saved theme from localStorage BEFORE React hydrates,
// then applies .dark class and enables transitions. This prevents the white flash.
const themeScript = `(function(){
  try {
    var t = localStorage.getItem('knust-pulse-theme') || 'dark';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = t;
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
  // Enable transitions after first paint
  window.requestAnimationFrame(function(){
    document.documentElement.classList.add('theme-ready');
  });
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      {/* dangerouslySetInnerHTML runs before any React render — critical for SSR theme */}
      <head>
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-white dark:bg-black text-[#0f1419] dark:text-[#e7e9ea] antialiased selection:bg-[#1d9bf0] selection:text-white transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
