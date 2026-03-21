import React, { useState } from 'react';
import { icons, User, LogOut, Settings, Lock, Zap, Menu, X, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { hasToolAccess } from '../lib/access';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ModeToggle } from './ModeToggle';
import { useTheme } from './ThemeProvider';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

// Color per plan for tool badges in dropdown
const planMeta = {
    FREE:    { label: "Gratuit",  cls: "bg-muted text-muted-foreground" },
    BASIC:   { label: "Basic",    cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    PREMIUM: { label: "Premium",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
};

function ToolItem({ tool, user }) {
    const Icon = getIcon(tool.icon);
    const accessible = hasToolAccess(user, tool);
    const planName = tool.minPlan?.name ?? "FREE";
    const meta = planMeta[planName] ?? planMeta.FREE;

    if (!accessible) {
        return (
            <li className="flex items-start gap-3 rounded-lg p-3 opacity-50 cursor-not-allowed">
                <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground leading-none">{tool.name}</p>
                        {planName !== "FREE" && (
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", meta.cls)}>
                                {meta.label}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tool.description}</p>
                </div>
            </li>
        );
    }

    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    href={`/convertisseur/${tool.slug}`}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent group outline-none focus:bg-accent"
                >
                    <div className="rounded-md bg-primary/10 p-1.5 shrink-0 mt-0.5 group-hover:bg-primary transition-colors">
                        <Icon className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground leading-none">{tool.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tool.description}</p>
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    );
}

function UserAvatar({ firstname, lastname, size = "md" }) {
    const initials = `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase();
    return (
        <div className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold shrink-0",
            size === "md" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
        )}>
            {initials || <User className="h-4 w-4" />}
        </div>
    );
}

function GenerationBar({ generationsToday, limitGeneration }) {
    if (!limitGeneration || limitGeneration <= 0) return null;
    const remaining = Math.max(0, limitGeneration - generationsToday);
    const pct = Math.min(100, Math.round((generationsToday / limitGeneration) * 100));
    const full = remaining === 0;
    const warn = pct >= 80;
    return (
        <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Conversions restantes
                </span>
                <span className={cn("font-semibold tabular-nums", full ? "text-red-500" : warn ? "text-orange-500" : "text-foreground")}>
                    {remaining}/{limitGeneration}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", full ? "bg-red-500" : warn ? "bg-orange-500" : "bg-primary")}
                    style={{ width: `${Math.max(4, 100 - pct)}%` }}
                />
            </div>
            {full && (
                <p className="text-[10px] text-red-500 font-medium">
                    Limite atteinte · réinitialisation à minuit
                </p>
            )}
        </div>
    );
}


export default function Header({ tools = [], user = null }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? '/images/logo-icon-dark.png' : '/images/logo-icon.png';
    const [mobileOpen, setMobileOpen] = useState(false);

    const planName = user?.plan?.name;
    const planM = planName ? (planMeta[planName] ?? planMeta.FREE) : null;

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between gap-4">

                {/* ── Logo ── */}
                <a href="/" className="flex items-center shrink-0">
                    <img src={logoSrc} alt="ZenPDF" className="w-28" />
                </a>

                {/* ── Desktop nav ── */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="gap-0.5">

                        <NavigationMenuItem>
                            <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                                Accueil
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {tools.length > 0 && (
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Outils</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="w-[520px] p-3">
                                        <div className="mb-2 px-3 py-1.5">
                                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                Convertisseurs PDF
                                            </p>
                                        </div>
                                        <ul className="grid grid-cols-2 gap-0.5">
                                            {tools.map((tool) => (
                                                <ToolItem key={tool.id} tool={tool} user={user} />
                                            ))}
                                        </ul>
                                        <div className="mt-2 pt-2 border-t border-border">
                                            <a
                                                href="/convertisseur"
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                            >
                                                Tous les outils
                                                <ArrowRight className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        )}

                        <NavigationMenuItem>
                            <NavigationMenuLink href="/abonnement" className={navigationMenuTriggerStyle()}>
                                Tarifs
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink href="/historique" className={navigationMenuTriggerStyle()}>
                                Historique
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink href="/contact" className={navigationMenuTriggerStyle()}>
                                Contact
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                    </NavigationMenuList>
                </NavigationMenu>

                {/* ── Right ── */}
                <div className="flex items-center gap-2 shrink-0">
                    <ModeToggle />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-accent transition-colors outline-none ring-0">
                                    <UserAvatar firstname={user.firstname} lastname={user.lastname} />
                                    <div className="hidden sm:flex flex-col items-start leading-none">
                                        <span className="text-sm font-medium max-w-[100px] truncate">{user.firstname}</span>
                                        {planM && (
                                            <span className={cn("text-[10px] font-semibold mt-0.5", planM.cls.split(' ').find(c => c.startsWith('text-')))}>
                                                {planM.label}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64">
                                {/* User info block */}
                                <div className="px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar firstname={user.firstname} lastname={user.lastname} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {user.firstname} {user.lastname}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            {planM && (
                                                <span className={cn("inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", planM.cls)}>
                                                    {planName === "PREMIUM" ? <Crown className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                                                    {planM.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <GenerationBar
                                        generationsToday={user.generationsToday ?? 0}
                                        limitGeneration={user.limitGeneration}
                                    />
                                </div>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <a href="/compte" className="flex items-center gap-2 cursor-pointer">
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        Mon compte
                                    </a>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <a href="/abonnement" className="flex items-center gap-2 cursor-pointer">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        Gérer mon abonnement
                                    </a>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <a href="/logout" className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500">
                                        <LogOut className="h-4 w-4" />
                                        Se déconnecter
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/login">Connexion</a>
                            </Button>
                            <Button size="sm" asChild>
                                <a href="/register">S'inscrire</a>
                            </Button>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Menu"
                    >
                        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
                    <nav className="max-w-5xl mx-auto px-4 py-3 space-y-1">
                        {[
                            { href: "/",           label: "Accueil" },
                            { href: "/convertisseur", label: "Outils" },
                            { href: "/abonnement", label: "Tarifs" },
                            { href: "/historique", label: "Historique" },
                            { href: "/contact",    label: "Contact" },
                        ].map(({ href, label }) => (
                            <a
                                key={href}
                                href={href}
                                className="flex items-center h-9 px-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                            >
                                {label}
                            </a>
                        ))}

                        {!user && (
                            <div className="flex gap-2 pt-2 border-t border-border mt-2">
                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                    <a href="/login">Connexion</a>
                                </Button>
                                <Button size="sm" className="flex-1" asChild>
                                    <a href="/register">S'inscrire</a>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}