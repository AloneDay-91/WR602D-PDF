import React, { useState } from "react";
import { FileDown, Zap, Shield, Scissors } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert, downloadBlob } from "../lib/fetchConvert";
import DropZone from "../components/DropZone";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const FEATURES = [
    { icon: Scissors, title: "Découpe précise",  desc: "Par intervalles ou plages de pages" },
    { icon: Zap,      title: "Rapide",            desc: "Découpe en quelques secondes" },
    { icon: Shield,   title: "Sécurisé",          desc: "Fichiers supprimés après traitement" },
];

export default function SplitPage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [splitMode, setSplitMode] = useState("intervals");
    const [splitSpan, setSplitSpan] = useState("1");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("splitMode", splitMode);
        formData.append("splitSpan", splitSpan);
        try {
            const response = await fetchConvert("/convertisseur/split", formData);
            if (!response) return; // 403 handled by ToolPageLayout dialog
            const blob = await response.blob();
            downloadBlob(blob, "split.zip");
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
                        <Label>Fichier PDF</Label>
                        <DropZone
                            file={file}
                            onFile={setFile}
                            onRemove={() => setFile(null)}
                            accept=".pdf"
                            hint="Fichiers PDF uniquement"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mode de découpe</Label>
                            <select
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                value={splitMode}
                                onChange={(e) => setSplitMode(e.target.value)}
                            >
                                <option value="intervals">Par intervalles</option>
                                <option value="pages">Par pages</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>{splitMode === "intervals" ? "Intervalle (ex: 1)" : "Pages (ex: 1-3)"}</Label>
                            <Input
                                value={splitSpan}
                                onChange={(e) => setSplitSpan(e.target.value)}
                                placeholder={splitMode === "intervals" ? "1" : "1-3"}
                            />
                        </div>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" disabled={loading || !file}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Découpe en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            Découper le PDF
                        </span>
                    )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">Le résultat sera téléchargé dans un fichier .zip</p>
            </form>
        </ToolPageLayout>
    );
}