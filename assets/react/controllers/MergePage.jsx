import React, { useState, useRef } from "react";
import { icons, FileDown, Upload, X, ArrowLeft, Zap, Hd, LockKeyhole, Plus } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../components/ui/item";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

export default function MergePage({ tool, allTools = [], user = null }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const Icon = getIcon(tool.icon);

    const addFiles = (newFiles) => {
        const pdfs = Array.from(newFiles).filter(f => f.type === "application/pdf");
        setFiles(prev => [...prev, ...pdfs]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

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
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Fichiers PDF à fusionner</label>
                                    <p className="text-xs text-muted-foreground">Les fichiers seront fusionnés dans l'ordre indiqué.</p>

                                    {files.length > 0 && (
                                        <ul className="space-y-2">
                                            {files.map((f, i) => (
                                                <li key={i} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                                                    <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                                                    <span className="flex-1 truncate font-medium">{f.name}</span>
                                                    <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} Ko</span>
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(i)}>
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

                                <Button type="submit" size="lg" className="w-full" disabled={loading || files.length < 2}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Fusion en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <FileDown className="h-4 w-4" />
                                            Fusionner {files.length > 0 ? `(${files.length} fichiers)` : ""}
                                        </span>
                                    )}
                                </Button>
                                {files.length < 2 && (
                                    <p className="text-xs text-center text-muted-foreground">Ajoutez au moins 2 fichiers PDF</p>
                                )}
                            </form>
                        </Card>

                        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><Zap className="h-4 w-4" /></ItemMedia>
                                <ItemContent><ItemTitle>Rapide</ItemTitle><ItemDescription>Fusion en quelques secondes</ItemDescription></ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><Hd className="h-4 w-4" /></ItemMedia>
                                <ItemContent><ItemTitle>Ordre préservé</ItemTitle><ItemDescription>Les pages sont fusionnées dans l'ordre</ItemDescription></ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><LockKeyhole className="h-4 w-4" /></ItemMedia>
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