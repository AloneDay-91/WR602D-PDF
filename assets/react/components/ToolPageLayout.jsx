import React, { useState, useEffect } from "react";
import { icons, ArrowLeft, Zap, Shield, Clock, X, AlertTriangle } from "lucide-react";
import { ThemeProvider } from "./ThemeProvider";
import Header from "./Header";
import Footer from "./Footer";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

const planMeta = {
    FREE:    { label: "Gratuit", cls: "bg-muted text-muted-foreground border-border" },
    BASIC:   { label: "Basic",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    PREMIUM: { label: "Premium", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
};

const DEFAULT_FEATURES = [
    { icon: Zap,    title: "Rapide",   desc: "Résultat en quelques secondes" },
    { icon: Clock,  title: "Fiable",   desc: "Rendu haute qualité garanti" },
    { icon: Shield, title: "Sécurisé", desc: "Fichiers supprimés après traitement" },
];

function LimitReachedDialog({ onClose }) {
    useEffect(() => {
        const handler = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 dark:bg-amber-950 p-3 shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="font-semibold text-sm">Limite journalière atteinte</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                    Vous avez atteint votre limite de conversions pour aujourd'hui. Passez à un plan supérieur pour augmenter ou supprimer cette limite.
                </p>

                <div className="flex flex-col gap-2">
                    <a
                        href="/abonnement"
                        className="inline-flex items-center justify-center w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors"
                    >
                        Voir les formules
                    </a>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center w-full rounded-lg border border-border text-sm font-medium px-4 py-2.5 hover:bg-muted transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ToolPageLayout({
    tool,
    allTools = [],
    user = null,
    features = DEFAULT_FEATURES,
    children,
}) {
    const Icon = getIcon(tool.icon);
    const planName = tool.minPlan?.name;
    const meta = planName ? (planMeta[planName] ?? planMeta.FREE) : null;
    const [limitReached, setLimitReached] = useState(false);

    useEffect(() => {
        const handler = () => setLimitReached(true);
        window.addEventListener("zenpdf:limitReached", handler);
        return () => window.removeEventListener("zenpdf:limitReached", handler);
    }, []);

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                {limitReached && <LimitReachedDialog onClose={() => setLimitReached(false)} />}
                <Header tools={allTools} user={user} />

                <main className="flex-1">
                    {/* ── Hero ── */}
                    <div className="relative border-b border-border bg-gradient-to-br from-primary/8 via-primary/4 to-background overflow-hidden">
                        <div className="absolute inset-0 -z-10 pointer-events-none">
                            <div className="absolute -top-16 right-0 w-[400px] h-[250px] bg-primary/5 rounded-full blur-3xl" />
                        </div>
                        <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">
                            {/* Back link */}
                            <a
                                href="/convertisseur"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Tous les outils
                            </a>

                            {/* Icon + title */}
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-primary/10 p-3.5 shrink-0">
                                    <Icon className="h-7 w-7 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-2xl font-extrabold tracking-tight">{tool.name}</h1>
                                        {meta && planName !== "FREE" && (
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", meta.cls)}>
                                                {meta.label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{tool.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Form ── */}
                    <div className="max-w-3xl mx-auto px-6 py-8">
                        {children}
                    </div>

                    {/* ── Features strip ── */}
                    <div className="max-w-3xl mx-auto px-6 pb-12">
                        <div className="grid grid-cols-3 gap-3">
                            {features.map(({ icon: FIcon, title, desc }) => (
                                <div key={title} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2 w-fit">
                                        <FIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">{title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}