import React from 'react';
import { useTheme } from './ThemeProvider';
import {ModeToggle} from "./ModeToggle";

export default function Footer() {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? '/images/logo-icon-dark.png' : '/images/logo-icon.png';
    return (
        <footer className="border-t border-border bg-background w-full py-4">
            <div className="flex flex-row items-center justify-between gap-2 w-full max-w-5xl mx-auto">
                <div>
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5">
                        <img src={logoSrc} alt="ZenPDF logo" className="w-24" />
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle/>
                    <p className="text-xs text-muted-foreground">© 2026 ZenPDF. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    )
}
