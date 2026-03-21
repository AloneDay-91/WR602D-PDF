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
    Share2, X, Plus, Check, Trash2, Package,
} from "lucide-react";
import { cn } from "../lib/utils";
import { downloadBlob } from "../lib/fetchConvert";

// ─── Config outils ────────────────────────────────────────────────────────────
const TOOL_META = {
    url:        { label: "URL → PDF",        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",       dot: "bg-blue-500" },
    html:       { label: "HTML → PDF",       color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300", dot: "bg-orange-500" },
    markdown:   { label: "Markdown → PDF",   color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",        dot: "bg-cyan-500" },
    screenshot: { label: "Screenshot",       color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",         dot: "bg-pink-500" },
    wysiwyg:    { label: "WYSIWYG → PDF",    color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300", dot: "bg-violet-500" },
    word:       { label: "Word → PDF",       color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300", dot: "bg-indigo-500" },
    excel:      { label: "Excel → PDF",      color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",   dot: "bg-green-500" },
    powerpoint: { label: "PowerPoint → PDF", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",           dot: "bg-red-500" },
    image:      { label: "Image → PDF",      color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",       dot: "bg-pink-500" },
    merge:      { label: "Fusion PDF",       color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300", dot: "bg-purple-500" },
    split:      { label: "Découpage PDF",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", dot: "bg-yellow-500" },
    pdfa:       { label: "PDF/A",            color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",       dot: "bg-teal-500" },
    encrypt:    { label: "Chiffrement",      color: "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300",   dot: "bg-slate-500" },
    compress:   { label: "Compression",      color: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",       dot: "bg-lime-500" },
};

function getMeta(slug) {
    return TOOL_META[slug] ?? { label: slug, color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
}

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

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, className }) {
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(); }}
            className={cn(
                "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                checked
                    ? "bg-primary border-primary"
                    : "border-input bg-background hover:border-primary/60",
                className
            )}
        >
            {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
        </button>
    );
}

// ─── Share modal ──────────────────────────────────────────────────────────────
function ShareModal({ gen, contacts: initialContacts, onClose }) {
    const [contacts, setContacts]         = useState(initialContacts);
    const [selected, setSelected]         = useState([]);
    const [sending, setSending]           = useState(false);
    const [sent, setSent]                 = useState(false);
    const [newFirstname, setNewFirstname] = useState("");
    const [newLastname, setNewLastname]   = useState("");
    const [newEmail, setNewEmail]         = useState("");
    const [addingContact, setAdding]      = useState(false);

    const toggle = (id) => setSelected(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

    const handleShare = async () => {
        if (!selected.length) return;
        setSending(true);
        try {
            const res = await fetch(`/historique/${gen.id}/share`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contacts: selected }),
            });
            if (res.ok) setSent(true);
            else alert("Erreur lors de l'envoi.");
        } catch {
            alert("Erreur de connexion.");
        } finally {
            setSending(false);
        }
    };

    const handleAddContact = async () => {
        if (!newEmail) return;
        setAdding(true);
        try {
            const res = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstname: newFirstname, lastname: newLastname, email: newEmail }),
            });
            if (res.ok) {
                const contact = await res.json();
                setContacts(prev => [...prev, contact]);
                setNewFirstname(""); setNewLastname(""); setNewEmail("");
            } else {
                alert("Erreur lors de la création du contact.");
            }
        } catch {
            alert("Erreur de connexion.");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteContact = async (id) => {
        try {
            await fetch(`/api/contacts/${id}`, { method: "DELETE" });
            setContacts(prev => prev.filter(c => c.id !== id));
            setSelected(prev => prev.filter(x => x !== id));
        } catch {
            alert("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="font-bold text-foreground">Partager le document</h2>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]">{gen.originalFilename ?? "Document"}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {sent ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                        <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-semibold text-foreground">Document partagé !</p>
                        <p className="text-sm text-muted-foreground">
                            Le PDF a été envoyé à {selected.length} contact{selected.length > 1 ? "s" : ""}.
                        </p>
                        <Button onClick={onClose} size="sm">Fermer</Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {contacts.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Aucun contact. Ajoutez-en un ci-dessous.</p>
                            ) : contacts.map(c => (
                                <div key={c.id} className={cn(
                                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
                                    selected.includes(c.id) ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"
                                )} onClick={() => toggle(c.id)}>
                                    <div className={cn(
                                        "h-4 w-4 rounded-sm border flex items-center justify-center shrink-0",
                                        selected.includes(c.id) ? "bg-primary border-primary" : "border-input"
                                    )}>
                                        {selected.includes(c.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{c.firstname} {c.lastname}</p>
                                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteContact(c.id); }}>
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border p-4 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ajouter un contact</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Prénom" value={newFirstname} onChange={e => setNewFirstname(e.target.value)} className="h-8 text-sm" />
                                <Input placeholder="Nom" value={newLastname} onChange={e => setNewLastname(e.target.value)} className="h-8 text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="h-8 text-sm flex-1" />
                                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={handleAddContact} disabled={addingContact || !newEmail}>
                                    <Plus className="h-3.5 w-3.5" />
                                    Ajouter
                                </Button>
                            </div>
                        </div>

                        <div className="border-t border-border p-4">
                            <Button className="w-full" disabled={!selected.length || sending} onClick={handleShare}>
                                {sending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Envoi…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Share2 className="h-4 w-4" />
                                        Envoyer à {selected.length || ""} contact{selected.length > 1 ? "s" : ""}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
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
function GenerationRow({ gen, onShare, selected, onToggle }) {
    const meta = getMeta(gen.toolSlug);
    return (
        <div className={cn(
            "flex items-center gap-4 px-4 py-3.5 transition-colors group",
            selected ? "bg-primary/5" : "hover:bg-muted/40"
        )}>
            <Checkbox checked={selected} onChange={onToggle} />
            <div className="rounded-lg bg-primary/8 border border-primary/10 p-2 shrink-0">
                <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                    {gen.originalFilename ?? "Document PDF"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(gen.createdAt)}
                </p>
            </div>
            <span className={cn("hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0", meta.color)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dot)} />
                {meta.label}
            </span>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {gen.downloadUrl && (
                    <a href={gen.downloadUrl} title="Télécharger"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg px-2.5 py-1.5 hover:bg-primary/5">
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                    </a>
                )}
                {gen.downloadUrl && (
                    <button onClick={() => onShare(gen)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
                        <Share2 className="h-3.5 w-3.5" />
                        Partager
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Card (vue grille) ────────────────────────────────────────────────────────
function GenerationCard({ gen, onShare, selected, onToggle }) {
    const meta = getMeta(gen.toolSlug);
    return (
        <div className={cn(
            "relative rounded-xl border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-all group",
            selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
        )}>
            {/* Checkbox overlay */}
            <div className="absolute top-3 left-3">
                <Checkbox checked={selected} onChange={onToggle} />
            </div>
            <div className="flex items-start justify-between gap-2 pl-6">
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
                <div className="flex gap-2">
                    <a href={gen.downloadUrl}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg py-1.5 hover:bg-primary/5 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                    </a>
                    <button onClick={() => onShare(gen)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-foreground border border-border rounded-lg py-1.5 hover:bg-muted transition-colors">
                        <Share2 className="h-3.5 w-3.5" />
                        Partager
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function HistoriquePage({ generations = [], user = null, tools = [], contacts: initialContacts = [] }) {
    const [search,      setSearch]   = useState("");
    const [filter,      setFilter]   = useState("all");
    const [viewMode,    setView]     = useState("list");
    const [sortDesc,    setSortDesc] = useState(true);
    const [shareGen,    setShareGen] = useState(null);
    const [contacts,    setContacts] = useState(initialContacts);
    const [selectedIds, setSelected] = useState([]);
    const [zipping,     setZipping]  = useState(false);

    const totalDocs   = generations.length;
    const uniqueTools = new Set(generations.map((g) => g.toolSlug)).size;
    const todayCount  = generations.filter((g) => {
        if (!g.createdAt) return false;
        const d = new Date(g.createdAt), n = new Date();
        return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;

    const toolOptions = useMemo(() => {
        const slugs = [...new Set(generations.map((g) => g.toolSlug))];
        return slugs.map((s) => ({ slug: s, label: getMeta(s).label }));
    }, [generations]);

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

    // Selection helpers
    const selectableIds = filtered.filter(g => g.downloadUrl).map(g => g.id);
    const allSelected   = selectableIds.length > 0 && selectableIds.every(id => selectedIds.includes(id));

    const toggleSelect = (id) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const toggleSelectAll = () =>
        allSelected ? setSelected([]) : setSelected(prev => [...new Set([...prev, ...selectableIds])]);

    const clearSelection = () => setSelected([]);

    // Batch ZIP download
    const handleBatchDownload = async () => {
        if (!selectedIds.length) return;
        setZipping(true);
        try {
            const res = await fetch("/historique/download-zip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            });
            if (!res.ok) {
                alert("Erreur lors de la création du ZIP.");
                return;
            }
            const blob = await res.blob();
            downloadBlob(blob, `zenpdf_${new Date().toISOString().slice(0, 10)}.zip`);
            clearSelection();
        } catch {
            alert("Erreur de connexion.");
        } finally {
            setZipping(false);
        }
    };

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1">
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                                <StatCard icon={FileText}   label="Documents"   value={totalDocs}   sub="au total" />
                                <StatCard icon={TrendingUp} label="Aujourd'hui" value={todayCount}  sub="conversions" />
                                <StatCard icon={Filter}     label="Outils"      value={uniqueTools} sub="différents utilisés" />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un document…"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); clearSelection(); }}
                                    className="pl-9"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <select
                                    value={filter}
                                    onChange={(e) => { setFilter(e.target.value); clearSelection(); }}
                                    className="h-9 w-full sm:w-48 rounded-md border border-input bg-background pl-9 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="all">Tous les outils</option>
                                    {toolOptions.map((t) => (
                                        <option key={t.slug} value={t.slug}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSortDesc((v) => !v)} className="gap-1.5 shrink-0">
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                {sortDesc ? "Plus récent" : "Plus ancien"}
                            </Button>
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

                        {/* Select all / count row */}
                        {filtered.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                                <p className="text-xs text-muted-foreground flex-1">
                                    {selectedIds.length > 0
                                        ? `${selectedIds.length} sélectionné${selectedIds.length > 1 ? "s" : ""}`
                                        : `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""}${filter !== "all" ? ` · ${getMeta(filter).label}` : ""}${search ? ` · "${search}"` : ""}`
                                    }
                                </p>
                            </div>
                        )}

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
                                    <Button asChild size="sm"><a href="/convertisseur">Convertir un document</a></Button>
                                )}
                            </div>
                        ) : viewMode === "list" ? (
                            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-card">
                                {filtered.map((gen) => (
                                    <GenerationRow
                                        key={gen.id}
                                        gen={gen}
                                        onShare={setShareGen}
                                        selected={selectedIds.includes(gen.id)}
                                        onToggle={() => toggleSelect(gen.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map((gen) => (
                                    <GenerationCard
                                        key={gen.id}
                                        gen={gen}
                                        onShare={setShareGen}
                                        selected={selectedIds.includes(gen.id)}
                                        onToggle={() => toggleSelect(gen.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>

            {/* Share modal */}
            {shareGen && (
                <ShareModal
                    gen={shareGen}
                    contacts={contacts}
                    onClose={() => setShareGen(null)}
                />
            )}

            {/* ── Sticky batch action bar ── */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border shadow-lg">
                    <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
                        <p className="flex-1 text-sm font-medium">
                            <span className="text-primary font-bold">{selectedIds.length}</span>
                            {" "}fichier{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
                        </p>
                        <Button variant="outline" size="sm" onClick={clearSelection} className="gap-1.5">
                            <X className="h-3.5 w-3.5" />
                            Annuler
                        </Button>
                        <Button size="sm" onClick={handleBatchDownload} disabled={zipping} className="gap-1.5">
                            {zipping ? (
                                <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Création du ZIP…
                                </>
                            ) : (
                                <>
                                    <Package className="h-3.5 w-3.5" />
                                    Télécharger en ZIP
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </ThemeProvider>
    );
}