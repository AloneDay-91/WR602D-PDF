import React from 'react';
import { useTheme } from './ThemeProvider';
import { ModeToggle } from './ModeToggle';
import { Shield, Zap } from 'lucide-react';

const navLinks = [
    {
        title: "Produit",
        items: [
            { label: "Accueil",       href: "/" },
            { label: "Outils PDF",    href: "/convertisseur" },
            { label: "Tarifs",        href: "/abonnement" },
            { label: "Historique",    href: "/historique" },
        ],
    },
    {
        title: "Entreprise",
        items: [
            { label: "Contact",       href: "/contact" },
            { label: "Mon compte",    href: "/compte" },
        ],
    },
];

export default function Footer() {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? '/images/logo-icon-dark.png' : '/images/logo-icon.png';

    return (
        <footer className="border-t border-border bg-muted/20">
            {/* Main content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 space-y-4">
                        <a href="/" className="inline-flex items-center">
                            <img src={logoSrc} alt="ZenPDF" className="w-28" />
                        </a>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Convertissez vos documents en PDF de qualité professionnelle, directement depuis votre navigateur.
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5 text-primary" />
                                Fichiers sécurisés
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Zap className="h-3.5 w-3.5 text-primary" />
                                Conversion instantanée
                            </div>
                        </div>
                    </div>

                    {/* Nav columns */}
                    {navLinks.map((col) => (
                        <div key={col.title} className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {col.title}
                            </p>
                            <ul className="space-y-2">
                                {col.items.map((item) => (
                                    <li key={item.href}>
                                        <a
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} ZenPDF. Tous droits réservés.
                    </p>
                    <ModeToggle />
                </div>
            </div>
        </footer>
    );
}