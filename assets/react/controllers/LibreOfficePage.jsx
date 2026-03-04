import React, { useState, useRef } from "react";
import { icons, FileText, FileDown, Upload, X, ArrowLeft, Zap, Hd, LockKeyhole } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../components/ui/item";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

const ACCEPT_BY_SLUG = {
    word:        ".doc,.docx,.docm,.dot,.dotm,.dotx,.odt,.rtf,.txt",
    excel:       ".xls,.xlsx,.xlsm,.xlsb,.xlt,.xltm,.xltx,.ods,.csv",
    powerpoint:  ".ppt,.pptx,.pptm,.pot,.potm,.potx,.pps,.odp",
    image:       ".jpg,.jpeg,.png,.bmp,.gif,.tif,.tiff,.psd",
};

const HINT_BY_SLUG = {
    word:        "Documents Word (.doc, .docx, .odt, .rtf…)",
    excel:       "Tableurs Excel (.xls, .xlsx, .ods, .csv…)",
    powerpoint:  "Présentations (.ppt, .pptx, .odp…)",
    image:       "Images (.jpg, .png, .tiff, .bmp…)",
};

export default function LibreOfficePage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const Icon = getIcon(tool.icon);
    const accept = ACCEPT_BY_SLUG[tool.slug] ?? "*";
    const hint   = HINT_BY_SLUG[tool.slug] ?? "Fichier à convertir";

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

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`/convertisseur/${tool.slug}`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = "converted.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } else {
                const text = await response.text();
                alert(text || "Une erreur est survenue lors de la conversion.");
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        Fichier à convertir
                                    </label>
                                    <div
                                        className={cn(
                                            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                                            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        )}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={accept}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
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
                                                <p className="text-sm text-muted-foreground">
                                                    Glissez-déposez votre fichier ici, ou{" "}
                                                    <span className="text-primary font-medium">parcourez</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">{hint}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={loading || !file}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Conversion en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <FileDown className="h-4 w-4" />
                                            Convertir en PDF
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </Card>

                        <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><Zap className="h-4 w-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Rapide</ItemTitle>
                                    <ItemDescription>Conversion en quelques secondes</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><Hd className="h-4 w-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Haute qualité</ItemTitle>
                                    <ItemDescription>Rendu fidèle via LibreOffice</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia variant="icon" className="text-primary"><LockKeyhole className="h-4 w-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Sécurisé</ItemTitle>
                                    <ItemDescription>Vos fichiers ne sont pas conservés</ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}