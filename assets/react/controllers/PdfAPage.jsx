import React, { useState } from "react";
import { FileDown, Archive, Zap, Shield } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert, downloadBlob } from "../lib/fetchConvert";
import DropZone from "../components/DropZone";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

const STANDARDS = [
    { value: "PDF/A-1b", label: "PDF/A-1b — Archivage basique (ISO 19005-1)" },
    { value: "PDF/A-2b", label: "PDF/A-2b — Archivage étendu (ISO 19005-2)" },
    { value: "PDF/A-3b", label: "PDF/A-3b — Avec pièces jointes (ISO 19005-3)" },
];

const FEATURES = [
    { icon: Archive, title: "Archivage long terme", desc: "Standard ISO certifié pour l'archivage" },
    { icon: Zap,     title: "Rapide",               desc: "Conversion en quelques secondes" },
    { icon: Shield,  title: "Sécurisé",             desc: "Fichiers supprimés après traitement" },
];

export default function PdfAPage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [standard, setStandard] = useState("PDF/A-2b");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("standard", standard);
        try {
            const response = await fetchConvert("/convertisseur/pdfa", formData);
            if (!response) return; // 403 handled by ToolPageLayout dialog
            const blob = await response.blob();
            downloadBlob(blob, "archived.pdf");
        } catch {
            alert("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout tool={tool} allTools={allTools} user={user} features={FEATURES}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                    <div className="space-y-3">
                        <Label>Fichier à convertir</Label>
                        <DropZone
                            file={file}
                            onFile={setFile}
                            onRemove={() => setFile(null)}
                            accept=".pdf,.doc,.docx,.odt"
                            hint="PDF, Word, ODT acceptés"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Standard d'archivage</Label>
                        <select
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            value={standard}
                            onChange={(e) => setStandard(e.target.value)}
                        >
                            {STANDARDS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" disabled={loading || !file}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Conversion en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            Convertir en {standard}
                        </span>
                    )}
                </Button>
            </form>
        </ToolPageLayout>
    );
}