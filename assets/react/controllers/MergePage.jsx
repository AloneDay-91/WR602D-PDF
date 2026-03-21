import React, { useState, useRef, useEffect } from "react";
import { FileDown, Plus, X, Shield, ArrowDownUp, Clock, CheckCircle, GripVertical, Upload, AlertCircle } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert } from "../lib/fetchConvert";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

const FEATURES = [
    { icon: ArrowDownUp, title: "Ordre préservé",  desc: "Pages fusionnées dans l'ordre choisi" },
    { icon: Clock,       title: "File d'attente",  desc: "Traitement asynchrone, reçu par email" },
    { icon: Shield,      title: "Sécurisé",        desc: "Fichiers supprimés après traitement" },
];

const POLL_INTERVAL = 2500;

export default function MergePage({ tool, allTools = [], user = null }) {
    const [files, setFiles]     = useState([]);
    const [loading, setLoading] = useState(false);

    // Queue polling state
    const [queueState, setQueueState] = useState(null); // null | { entryId, status, progress, message }
    const pollRef = useRef(null);

    // Zone-level drag-and-drop
    const [zoneDrag, setZoneDrag] = useState(0);
    const zoneIsDragging = zoneDrag > 0;

    // Drag-to-reorder
    const dragIndex  = useRef(null);
    const [dropTarget, setDropTarget] = useState(null);

    const fileInputRef = useRef(null);

    // ── Stop polling on unmount ────────────────────────────────────────────
    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    // ── File management ────────────────────────────────────────────────────
    const addFiles = (newFiles) => {
        const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf");
        setFiles(prev => [...prev, ...pdfs]);
    };

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    // ── Zone drag events ───────────────────────────────────────────────────
    const onZoneDragEnter = (e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes("Files")) setZoneDrag(c => c + 1);
    };
    const onZoneDragLeave = (e) => {
        e.preventDefault();
        setZoneDrag(c => Math.max(0, c - 1));
    };
    const onZoneDragOver = (e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
    };
    const onZoneDrop = (e) => {
        e.preventDefault();
        setZoneDrag(0);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    };

    // ── Item drag-to-reorder ───────────────────────────────────────────────
    const onItemDragStart = (e, index) => {
        dragIndex.current = index;
        e.dataTransfer.effectAllowed = "move";
    };
    const onItemDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragIndex.current !== null && dragIndex.current !== index) setDropTarget(index);
    };
    const onItemDrop = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTarget(null);
        if (dragIndex.current === null || dragIndex.current === index) return;
        setFiles(prev => {
            const next = [...prev];
            next.splice(index, 0, next.splice(dragIndex.current, 1)[0]);
            return next;
        });
        dragIndex.current = null;
    };
    const onItemDragEnd = () => { dragIndex.current = null; setDropTarget(null); };

    // ── Polling ────────────────────────────────────────────────────────────
    const startPolling = (entryId) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const res  = await fetch(`/api/queue/${entryId}/status`);
                const data = await res.json();
                setQueueState(prev => ({ ...prev, ...data }));
                if (data.status === "done" || data.status === "failed") {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
            } catch { /* network hiccup — keep polling */ }
        }, POLL_INTERVAL);
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length < 2) return;
        setLoading(true);
        const formData = new FormData();
        files.forEach(f => formData.append("files[]", f));
        try {
            const response = await fetchConvert("/convertisseur/merge", formData);
            if (!response) return;
            if (response.status === 202) {
                const data = await response.json();
                const entryId = data.entryId;
                setQueueState({ entryId, status: "pending", progress: 20, message: "En attente dans la file…" });
                setFiles([]);
                if (entryId) startPolling(entryId);
            } else {
                const text = await response.text();
                alert(text || "Une erreur est survenue.");
            }
        } catch {
            alert("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const resetQueue = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setQueueState(null);
    };

    // ── Queue progress screen ──────────────────────────────────────────────
    if (queueState) {
        const { status, progress, message } = queueState;
        const isDone   = status === "done";
        const isFailed = status === "failed";

        return (
            <ToolPageLayout tool={tool} allTools={allTools} user={user} features={FEATURES}>
                <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-5 text-center">
                    {/* Icon */}
                    {isDone ? (
                        <div className="rounded-full bg-green-100 dark:bg-green-950 p-4">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    ) : isFailed ? (
                        <div className="rounded-full bg-destructive/10 p-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    ) : (
                        <div className="rounded-full bg-primary/10 p-4">
                            <span className="h-8 w-8 block animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    )}

                    {/* Text */}
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            {isDone ? "Demande enregistrée !" : isFailed ? "Échec de la fusion" : "Traitement en cours…"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            {isDone
                                ? "Vous recevrez un email dès que votre PDF est prêt. Vous pourrez ensuite le télécharger depuis l'historique."
                                : message}
                        </p>
                    </div>

                    {/* Progress bar */}
                    {!isFailed && (
                        <div className="w-full max-w-sm space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progression</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-700",
                                        isDone ? "bg-green-500" : "bg-primary"
                                    )}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={resetQueue}>
                            Nouvelle fusion
                        </Button>
                        <Button asChild>
                            <a href="/historique">Voir l'historique</a>
                        </Button>
                    </div>
                </div>
            </ToolPageLayout>
        );
    }

    // ── Main form ──────────────────────────────────────────────────────────
    return (
        <ToolPageLayout tool={tool} allTools={allTools} user={user} features={FEATURES}>
            <form onSubmit={handleSubmit} className="space-y-5">

                <div
                    className={cn(
                        "rounded-xl border-2 border-dashed bg-card p-6 space-y-4 transition-colors",
                        zoneIsDragging ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onDragEnter={onZoneDragEnter}
                    onDragLeave={onZoneDragLeave}
                    onDragOver={onZoneDragOver}
                    onDrop={onZoneDrop}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Fichiers PDF à fusionner</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Glissez des fichiers ici ou cliquez pour en ajouter. Réorganisez en faisant glisser.
                            </p>
                        </div>
                        {files.length > 0 && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {files.length} fichier{files.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {files.length === 0 && (
                        <div className={cn(
                            "flex flex-col items-center gap-2 py-6 rounded-lg transition-colors",
                            zoneIsDragging ? "text-primary" : "text-muted-foreground"
                        )}>
                            <Upload className="h-8 w-8" />
                            <p className="text-sm font-medium">
                                {zoneIsDragging ? "Déposez vos PDFs ici" : "Glissez vos PDFs ici"}
                            </p>
                        </div>
                    )}

                    {files.length > 0 && (
                        <ul className="space-y-2">
                            {files.map((f, i) => (
                                <li
                                    key={i}
                                    draggable
                                    onDragStart={(e) => onItemDragStart(e, i)}
                                    onDragOver={(e) => onItemDragOver(e, i)}
                                    onDrop={(e) => onItemDrop(e, i)}
                                    onDragEnd={onItemDragEnd}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 transition-all",
                                        dropTarget === i ? "border-primary border-2 bg-primary/5" : "border-border"
                                    )}
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                                    <span className="text-xs font-semibold text-muted-foreground w-5 text-center tabular-nums">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{f.name}</p>
                                        <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} Ko</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(i)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                        <Plus className="h-4 w-4" />
                        Ajouter des PDFs
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden"
                        onChange={(e) => addFiles(e.target.files)} />
                </div>

                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                        La fusion est traitée de façon asynchrone. Vous recevrez le PDF par email une fois terminé.
                    </p>
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" disabled={loading || files.length < 2}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Envoi en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            Ajouter à la file {files.length >= 2 ? `(${files.length} fichiers)` : ""}
                        </span>
                    )}
                </Button>
                {files.length < 2 && (
                    <p className="text-xs text-center text-muted-foreground">Ajoutez au moins 2 fichiers PDF pour continuer.</p>
                )}
            </form>
        </ToolPageLayout>
    );
}