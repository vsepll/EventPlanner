"use client"

import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    e.preventDefault();
    if (pathname !== '/') {
      window.location.href = `/?view=${view}`;
      return;
    }
    
    const viewType = view === 'eventos' ? 'list' : 
                    view === 'calendario' ? 'calendar' : 
                    'financial';
                    
    // Emitir un evento personalizado que será capturado en la página principal
    window.dispatchEvent(new CustomEvent('changeView', { 
      detail: { view: viewType }
    }));
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(manrope.className, "antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/80">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-xl font-semibold tracking-tight text-white">
                    Planificador de Eventos
                  </Link>
                  <nav className="hidden md:flex gap-6">
                    <a 
                      href="#eventos" 
                      onClick={(e) => handleNavClick(e, 'eventos')}
                      className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                      Eventos
                    </a>
                    <a 
                      href="#calendario" 
                      onClick={(e) => handleNavClick(e, 'calendario')}
                      className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                      Calendario
                    </a>
                    <a 
                      href="#analisis" 
                      onClick={(e) => handleNavClick(e, 'analisis')}
                      className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                      Análisis
                    </a>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
