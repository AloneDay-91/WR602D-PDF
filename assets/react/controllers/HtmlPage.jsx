import React, { useState } from "react";
import { FileDown, Zap, Shield, Code } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert, downloadBlob } from "../lib/fetchConvert";
import DropZone from "../components/DropZone";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

const FEATURES = [
    { icon: Code,   title: "HTML natif",  desc: "CSS inline et styles embarqués supportés" },
    { icon: Zap,    title: "Rapide",      desc: "Conversion en quelques secondes" },
    { icon: Shield, title: "Sécurisé",   desc: "Fichiers supprimés après traitement" },
];

export default function HtmlPage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("htmlFile", file);
        try {
            const response = await fetchConvert("/convertisseur", formData);
            if (!response) return; // 403 handled by ToolPageLayout dialog
            const blob = await response.blob();
            downloadBlob(blob, "converted.pdf");
        } catch {
            alert("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout tool={tool} allTools={allTools} user={user} features={FEATURES}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                    <Label>Fichier HTML à convertir</Label>
                    <DropZone
                        file={file}
                        onFile={setFile}
                        onRemove={() => setFile(null)}
                        accept=".html,.htm"
                        hint="Fichiers .html ou .htm uniquement"
                    />
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
                            Convertir en PDF
                        </span>
                    )}
                </Button>
            </form>
        </ToolPageLayout>
    );
}