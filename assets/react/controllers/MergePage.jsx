import React, { useState, useRef } from "react";
import { icons, FileDown, Plus, X, Zap, Shield, ArrowDownUp } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

const FEATURES = [
    { icon: ArrowDownUp, title: "Ordre préservé", desc: "Pages fusionnées dans l'ordre choisi" },
    { icon: Zap,         title: "Rapide",          desc: "Fusion en quelques secondes" },
    { icon: Shield,      title: "Sécurisé",        desc: "Fichiers supprimés après traitement" },
];

export default function MergePage({ tool, allTools = [], user = null }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const addFiles = (newFiles) => {
        const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf");
        setFiles(prev => [...prev, ...pdfs]);
    };

    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length < 2) return;
        setLoading(true);
        const formData = new FormData();
        files.forEach(f => formData.append("files[]", f));
        try {
            const response = await fetch("/convertisseur/merge", { method: "POST", body: formData });
            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = "merged.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } else {
                alert((await response.text()) || "Une erreur est survenue.");
            }
        } catch {
            alert("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout tool={tool} allTools={allTools} user={user} features={FEATURES}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Fichiers PDF à fusionner</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">Les fichiers seront fusionnés dans l'ordre indiqué.</p>
                        </div>
                        {files.length > 0 && (
                            <span className="text-xs text-muted-foreground tabular-nums">{files.length} fichier{files.length > 1 ? "s" : ""}</span>
                        )}
                    </div>

                    {files.length > 0 && (
                        <ul className="space-y-2">
                            {files.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
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

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter des PDFs
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full shadow-md shadow-primary/20"
                    disabled={loading || files.length < 2}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Fusion en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            Fusionner {files.length >= 2 ? `(${files.length} fichiers)` : ""}
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