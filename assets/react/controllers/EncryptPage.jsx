import React, { useState, useRef } from "react";
import { icons, FileText, FileDown, Upload, X, ArrowLeft, Zap, LockKeyhole, ShieldCheck } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../components/ui/item";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

export default function EncryptPage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userPassword, setUserPassword] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const fileInputRef = useRef(null);

    const Icon = getIcon(tool.icon);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || (!userPassword && !ownerPassword)) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        if (userPassword)  formData.append("userPassword", userPassword);
        if (ownerPassword) formData.append("ownerPassword", ownerPassword);

        try {
            const response = await fetch("/convertisseur/encrypt", { method: "POST", body: formData });

            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = "encrypted.pdf";
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

    const canSubmit = file && (userPassword || ownerPassword);

    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={allTools} user={user} />

                <main className="flex-1 py-20 px-4">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <a href="/convertisseur" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux outils
                        </a>

                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-secondary text-primary p-3 shrink-0">
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-semibold">{tool.name}</h1>
                                <p className="text-muted-foreground">{tool.description}</p>
                            </div>
                        </div>

                        <Card className="p-6 shadow-none">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fichier PDF</label>
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                                            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        )}
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
                                        {file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="h-8 w-8 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} Ko</p>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">Glissez-déposez votre PDF ici, ou <span className="text-primary font-medium">parcourez</span></p>
                                                <p className="text-xs text-muted-foreground">Fichiers PDF uniquement</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mot de passe utilisateur</label>
                                        <Input
                                            type="password"
                                            placeholder="Requis pour ouvrir le PDF"
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Protège l'ouverture du document</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mot de passe propriétaire</label>
                                        <Input
                                            type="password"
                                            placeholder="Requis pour modifier le PDF"
                                            value={ownerPassword}
                                            onChange={(e) => setOwnerPassword(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Protège les permissions d'édition</p>
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={loading || !canSubmit}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Chiffrement en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <FileDown className="h-4 w-4" />
                                            Protéger le PDF
                                        </span>
                                    )}
                                </Button>
                                {!canSubmit && file && (
                                    <p className="text-xs text-center text-muted-foreground">Renseignez au moins un mot de passe</p>
                                )}
                            </form>
                        </Card>

                        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><LockKeyhole className="h-4 w-4" /></ItemMedia>
                                <ItemContent><ItemTitle>Chiffrement AES</ItemTitle><ItemDescription>Protection robuste du document</ItemDescription></ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><ShieldCheck className="h-4 w-4" /></ItemMedia>
                                <ItemContent><ItemTitle>Double protection</ItemTitle><ItemDescription>Ouverture et permissions séparées</ItemDescription></ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><Zap className="h-4 w-4" /></ItemMedia>
                                <ItemContent><ItemTitle>Sécurisé</ItemTitle><ItemDescription>Vos fichiers ne sont pas conservés</ItemDescription></ItemContent>
                            </Item>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}