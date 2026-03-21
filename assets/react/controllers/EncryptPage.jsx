import React, { useState } from "react";
import { FileDown, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert, downloadBlob } from "../lib/fetchConvert";
import DropZone from "../components/DropZone";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const FEATURES = [
    { icon: LockKeyhole,  title: "Chiffrement AES",     desc: "Protection robuste du document" },
    { icon: ShieldCheck,  title: "Double protection",   desc: "Ouverture et permissions séparées" },
    { icon: Zap,          title: "Sécurisé",            desc: "Fichiers supprimés après traitement" },
];

export default function EncryptPage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [userPassword, setUserPassword] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = file && (userPassword || ownerPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (userPassword)  formData.append("userPassword", userPassword);
        if (ownerPassword) formData.append("ownerPassword", ownerPassword);
        try {
            const response = await fetchConvert("/convertisseur/encrypt", formData);
            if (!response) return; // 403 handled by ToolPageLayout dialog
            const blob = await response.blob();
            downloadBlob(blob, "encrypted.pdf");
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Mot de passe utilisateur</Label>
                            <Input
                                type="password"
                                placeholder="Requis pour ouvrir le PDF"
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Protège l'ouverture du document</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Mot de passe propriétaire</Label>
                            <Input
                                type="password"
                                placeholder="Requis pour modifier le PDF"
                                value={ownerPassword}
                                onChange={(e) => setOwnerPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Protège les permissions d'édition</p>
                        </div>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" disabled={loading || !canSubmit}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Chiffrement en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            Protéger le PDF
                        </span>
                    )}
                </Button>
                {file && !canSubmit && (
                    <p className="text-xs text-center text-muted-foreground">Renseignez au moins un mot de passe pour continuer.</p>
                )}
            </form>
        </ToolPageLayout>
    );
}