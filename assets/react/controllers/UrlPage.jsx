import React, { useState } from "react";
import { icons, FileDown, Globe, Zap, Shield, Clock } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert, downloadBlob } from "../lib/fetchConvert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const FEATURES = [
    { icon: Globe,  title: "Toute page web",  desc: "URL publique ou intranet supportée" },
    { icon: Zap,    title: "Rapide",           desc: "Rendu complet en quelques secondes" },
    { icon: Shield, title: "Sécurisé",         desc: "Fichiers supprimés après traitement" },
];

export default function UrlPage({ tool, allTools = [], user = null }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("url", url);
        try {
            const response = await fetchConvert("/convertisseur/url", formData);
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
                <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                    <div className="space-y-2">
                        <Label>URL de la page à convertir</Label>
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Entrez l'URL complète de la page web à convertir en PDF.
                        </p>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" disabled={loading || !url}>
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