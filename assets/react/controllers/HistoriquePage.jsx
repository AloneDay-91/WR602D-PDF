import React, { useState, useMemo } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    FileText, Clock, Inbox, Download, Search,
    ArrowUpDown, Filter, Zap, LayoutGrid, List,
    ChevronDown, CalendarDays, TrendingUp,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Config outils ────────────────────────────────────────────────────────────
const TOOL_META = {
    url:        { label: "URL → PDF",        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",       dot: "bg-blue-500" },
    html:       { label: "HTML → PDF",       color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300", dot: "bg-orange-500" },
    word:       { label: "Word → PDF",       color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300", dot: "bg-indigo-500" },
    excel:      { label: "Excel → PDF",      color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",   dot: "bg-green-500" },
    powerpoint: { label: "PowerPoint → PDF", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",           dot: "bg-red-500" },
    image:      { label: "Image → PDF",      color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",       dot: "bg-pink-500" },
    merge:      { label: "Fusion PDF",       color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300", dot: "bg-purple-500" },
    split:      { label: "Découpage PDF",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", dot: "bg-yellow-500" },
    pdfa:       { label: "PDF/A",            color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",       dot: "bg-teal-500" },
    encrypt:    { label: "Chiffrement",      color: "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300",   dot: "bg-slate-500" },
};

function getMeta(slug) {
    return TOOL_META[slug] ?? { label: slug, color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
}

// ─── Formatage date ────────────────────────────────────────────────────────────
function formatDate(iso) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
}

function formatDateShort(iso) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub }) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-sm font-medium text-foreground">{label}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Row (vue liste) ──────────────────────────────────────────────────────────
function GenerationRow({ gen }) {
    const meta = getMeta(gen.toolSlug);
    return (
        <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/40 transition-colors group">
            {/* Icône */}
            <div className="rounded-lg bg-primary/8 border border-primary/10 p-2 shrink-0">
                <FileText className="h-4 w-4 text-primary" />
            </div>

            {/* Nom fichier */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                    {gen.originalFilename ?? "Document PDF"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(gen.createdAt)}
                </p>
            </div>

            {/* Badge outil */}
            <span className={cn("hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0", meta.color)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dot)} />
                {meta.label}
            </span>

            {/* Download */}
            {gen.downloadUrl ? (
                <a href={gen.downloadUrl} title={gen.originalFilename ?? "Télécharger"}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border border-primary/20 rounded-lg px-2.5 py-1.5 hover:bg-primary/5">
                    <Download className="h-3.5 w-3.5" />
                    Télécharger
                </a>
            ) : (
                <span className="w-24 shrink-0" />
            )}
        </div>
    );
}

// ─── Card (vue grille) ────────────────────────────────────────────────────────
function GenerationCard({ gen }) {
    const meta = getMeta(gen.toolSlug);
    return (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-md hover:border-primary/20 transition-all group">
            <div className="flex items-start justify-between gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", meta.color)}>
                    {meta.label}
                </span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                    {gen.originalFilename ?? "Document PDF"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDateShort(gen.createdAt)}
                </p>
            </div>
            {gen.downloadUrl && (
                <a href={gen.downloadUrl}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg py-1.5 hover:bg-primary/5 transition-colors">
                    <Download className="h-3.5 w-3.5" />
                    Télécharger
                </a>
            )}
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function HistoriquePage({ generations = [], user = null, tools = [] }) {
    const [search,  setSearch]  = useState("");
    const [filter,  setFilter]  = useState("all");
    const [viewMode, setView]   = useState("list"); // "list" | "grid"
    const [sortDesc, setSortDesc] = useState(true);

    // Stats
    const totalDocs   = generations.length;
    const uniqueTools = new Set(generations.map((g) => g.toolSlug)).size;
    const todayCount  = generations.filter((g) => {
        if (!g.createdAt) return false;
        const d = new Date(g.createdAt);
        const n = new Date();
        return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;

    // Outils uniques pour le filtre
    const toolOptions = useMemo(() => {
        const slugs = [...new Set(generations.map((g) => g.toolSlug))];
        return slugs.map((s) => ({ slug: s, label: getMeta(s).label }));
    }, [generations]);

    // Filtrage + tri
    const filtered = useMemo(() => {
        let list = [...generations];
        if (filter !== "all") list = list.filter((g) => g.toolSlug === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((g) =>
                (g.originalFilename ?? "").toLowerCase().includes(q) ||
                getMeta(g.toolSlug).label.toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            const da = new Date(a.createdAt ?? 0), db = new Date(b.createdAt ?? 0);
            return sortDesc ? db - da : da - db;
        });
        return list;
    }, [generations, filter, search, sortDesc]);

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1">
                    {/* ── Hero ── */}
                    <div className="relative border-b border-border bg-gradient-to-br from-primary/8 via-primary/4 to-background overflow-hidden">
                        <div className="absolute inset-0 -z-10 pointer-events-none">
                            <div className="absolute -top-20 right-0 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
                        </div>
                        <div className="max-w-5xl mx-auto px-6 py-10">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                <div>
                                    <Badge variant="outline" className="mb-3 gap-1.5 border-primary/30 text-primary text-xs">
                                        <Clock className="h-3 w-3" />
                                        Historique
                                    </Badge>
                                    <h1 className="text-3xl font-extrabold tracking-tight">Mes conversions</h1>
                                    <p className="text-muted-foreground text-sm mt-1.5">
                                        Retrouvez et téléchargez tous vos documents générés.
                                    </p>
                                </div>
                                <Button asChild>
                                    <a href="/convertisseur">
                                        <Zap className="mr-1 h-4 w-4" />
                                        Nouvelle conversion
                                    </a>
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                                <StatCard icon={FileText}   label="Documents" value={totalDocs}  sub="au total" />
                                <StatCard icon={TrendingUp} label="Aujourd'hui" value={todayCount} sub="conversions" />
                                <StatCard icon={Filter}     label="Outils"     value={uniqueTools} sub="différents utilisés" />
                            </div>
                        </div>
                    </div>

                    {/* ── Contenu ── */}
                    <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">

                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            {/* Recherche */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un document…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Filtre outil */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="h-9 w-full sm:w-48 rounded-md border border-input bg-background pl-9 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="all">Tous les outils</option>
                                    {toolOptions.map((t) => (
                                        <option key={t.slug} value={t.slug}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <Button variant="outline" size="sm" onClick={() => setSortDesc((v) => !v)}
                                className="gap-1.5 shrink-0">
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                {sortDesc ? "Plus récent" : "Plus ancien"}
                            </Button>

                            {/* View toggle */}
                            <div className="flex rounded-md border border-input overflow-hidden shrink-0">
                                <button onClick={() => setView("list")}
                                    className={cn("px-2.5 py-1.5 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>
                                    <List className="h-4 w-4" />
                                </button>
                                <button onClick={() => setView("grid")}
                                    className={cn("px-2.5 py-1.5 transition-colors border-l border-input", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Résultat count */}
                        <p className="text-xs text-muted-foreground">
                            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                            {filter !== "all" ? ` · ${getMeta(filter).label}` : ""}
                            {search ? ` · "${search}"` : ""}
                        </p>

                        {/* Liste ou grille */}
                        {filtered.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                                <Inbox className="h-12 w-12 opacity-30" />
                                <div className="text-center">
                                    <p className="font-medium">Aucun document trouvé</p>
                                    <p className="text-sm mt-1">
                                        {generations.length === 0
                                            ? "Vous n'avez pas encore généré de document."
                                            : "Essayez de modifier vos filtres."}
                                    </p>
                                </div>
                                {generations.length === 0 && (
                                    <Button asChild size="sm">
                                        <a href="/convertisseur">Convertir un document</a>
                                    </Button>
                                )}
                            </div>
                        ) : viewMode === "list" ? (
                            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-card">
                                {filtered.map((gen) => <GenerationRow key={gen.id} gen={gen} />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map((gen) => <GenerationCard key={gen.id} gen={gen} />)}
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
