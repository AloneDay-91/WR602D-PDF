import React, { useState, useMemo, useEffect } from "react";
import { icons, Lock, ArrowRight, Search, Zap, FileText, X, Crown } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { hasToolAccess } from "../../lib/access";
import { cn } from "../../lib/utils";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

const planMeta = {
    FREE:    { label: "Gratuit", dot: "bg-muted-foreground",  badge: "bg-muted text-muted-foreground border-border" },
    BASIC:   { label: "Basic",   dot: "bg-blue-500",          badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    PREMIUM: { label: "Premium", dot: "bg-amber-500",         badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
};

function UpgradeDialog({ tool, onClose }) {
    const planName = tool?.minPlan?.name ?? "BASIC";
    const meta = planMeta[planName] ?? planMeta.BASIC;
    const Icon = getIcon(tool?.icon);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    if (!tool) return null;

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
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-muted p-3 shrink-0">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{tool.name}</p>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", meta.badge)}>
                            {meta.label}
                        </span>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Fonctionnalité réservée</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Cet outil nécessite le plan <strong>{meta.label}</strong>. Passez à un plan supérieur pour y accéder.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <a href="/abonnement">
                            <Crown className="h-3.5 w-3.5 mr-2" />
                            Voir les formules
                        </a>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onClose}>
                        Fermer
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ToolCard({ tool, user, onLocked }) {
    const Icon = getIcon(tool.icon);
    const accessible = hasToolAccess(user, tool);
    const planName = tool.minPlan?.name ?? "FREE";
    const meta = planMeta[planName] ?? planMeta.FREE;

    const inner = (
        <div className={cn(
            "relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 h-full",
            accessible
                ? "hover:shadow-md hover:border-primary/30 group cursor-pointer"
                : "opacity-55 grayscale cursor-pointer hover:opacity-70"
        )}>
            {/* Icon + plan badge */}
            <div className="flex items-start justify-between">
                <div className={cn(
                    "rounded-xl p-3 transition-colors shrink-0",
                    accessible
                        ? "bg-primary/10 group-hover:bg-primary"
                        : "bg-muted"
                )}>
                    {accessible
                        ? <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                        : <Lock className="h-5 w-5 text-muted-foreground" />
                    }
                </div>

                {planName !== "FREE" && (
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", meta.badge)}>
                        {meta.label}
                    </span>
                )}
            </div>

            {/* Text */}
            <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{tool.name}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{tool.description}</p>
            </div>

            {/* Footer */}
            {accessible ? (
                <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Convertir
                    <ArrowRight className="h-3 w-3" />
                </div>
            ) : (
                <p className="text-[11px] text-muted-foreground">
                    Nécessite <strong>{meta.label}</strong>
                </p>
            )}
        </div>
    );

    if (accessible) {
        return (
            <a href={`/convertisseur/${tool.slug}`} className="group h-full">
                {inner}
            </a>
        );
    }

    return (
        <div className="h-full cursor-pointer" onClick={() => onLocked(tool)}>
            {inner}
        </div>
    );
}

export default function ConvertSection({ tools = [], user = null }) {
    const [search, setSearch] = useState("");

    // Auto-open dialog if redirected from a 403 (e.g. ?forbidden=split)
    const [lockedTool, setLockedTool] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("forbidden");
        if (!slug) return null;
        return tools.find((t) => t.slug === slug) ?? null;
    });

    const filtered = useMemo(() => {
        if (!search.trim()) return tools;
        const q = search.toLowerCase();
        return tools.filter((t) =>
            t.name.toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q)
        );
    }, [tools, search]);

    const accessibleCount = tools.filter((t) => hasToolAccess(user, t)).length;

    return (
        <>
            {/* ── Hero ── */}
            <div className="relative border-b border-border bg-gradient-to-br from-primary/8 via-primary/4 to-background overflow-hidden">
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute -top-20 right-0 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
                </div>
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <Badge variant="outline" className="mb-3 gap-1.5 border-primary/30 text-primary text-xs">
                                <Zap className="h-3 w-3" />
                                Outils PDF
                            </Badge>
                            <h1 className="text-3xl font-extrabold tracking-tight">Convertisseur PDF</h1>
                            <p className="text-muted-foreground text-sm mt-1.5">
                                Choisissez un outil et convertissez vos fichiers en quelques secondes.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="text-center">
                                <p className="text-2xl font-bold tabular-nums">{tools.length}</p>
                                <p className="text-xs text-muted-foreground">Outils</p>
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <div className="text-center">
                                <p className="text-2xl font-bold tabular-nums">{accessibleCount}</p>
                                <p className="text-xs text-muted-foreground">Accessibles</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un outil…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Result count */}
                <p className="text-xs text-muted-foreground">
                    {filtered.length} outil{filtered.length !== 1 ? "s" : ""}
                    {search ? ` · "${search}"` : ""}
                </p>

                {/* Grid */}
                {lockedTool && (
                    <UpgradeDialog tool={lockedTool} onClose={() => {
                        setLockedTool(null);
                        // Remove ?forbidden= from URL without reloading
                        const url = new URL(window.location.href);
                        url.searchParams.delete("forbidden");
                        window.history.replaceState({}, "", url.toString());
                    }} />
                )}

                {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                        <FileText className="h-12 w-12 opacity-30" />
                        <div className="text-center">
                            <p className="font-medium">Aucun outil trouvé</p>
                            <p className="text-sm mt-1">Essayez de modifier votre recherche.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                            Réinitialiser
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} user={user} onLocked={setLockedTool} />
                        ))}
                    </div>
                )}

                {/* Upgrade nudge for non-premium users */}
                {user && tools.some((t) => !hasToolAccess(user, t)) && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-foreground">Accédez à tous les outils</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Passez à un plan supérieur pour débloquer les outils verrouillés.
                            </p>
                        </div>
                        <Button size="sm" asChild className="shrink-0">
                            <a href="/abonnement">
                                Voir les formules
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}