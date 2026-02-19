import React, { useState, useRef } from "react";
import { icons, FileText, FileDown, Upload, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

function getIcon(iconName) {
    return icons[iconName] || icons.Wrench;
}

export default function ConvertSection({ tools = [] }) {
    const [activeTab, setActiveTab] = useState(tools.length > 0 ? String(tools[0].id) : "url");
    const [url, setUrl] = useState("");
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        if (file) {
            formData.append("htmlFile", file);
        } else if (url) {
            formData.append("url", url);
        }

        try {
            const response = await fetch("/convertisseur", {
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

    const isUrlTool = (tool) => {
        const name = tool.name.toLowerCase();
        return name.includes("url") || name.includes("site") || name.includes("web");
    };

    return (
        <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl">Convertisseur PDF</h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Convertissez vos fichiers et URLs en PDF en quelques clics.
                    </p>
                </div>

                {tools.length > 1 ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full flex flex-wrap h-auto gap-1">
                            {tools.map((tool) => {
                                const Icon = getIcon(tool.icon);
                                return (
                                    <TabsTrigger
                                        key={tool.id}
                                        value={String(tool.id)}
                                        className="flex items-center gap-2 px-4 py-2"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tool.name}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {tools.map((tool) => (
                            <TabsContent key={tool.id} value={String(tool.id)}>
                                <Card className="p-6 shadow-none">
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {tool.description}
                                    </p>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {isUrlTool(tool) ? (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    URL à convertir
                                                </label>
                                                <Input
                                                    type="url"
                                                    placeholder="https://example.com"
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Fichier à convertir
                                                </label>
                                                <div
                                                    className={cn(
                                                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                                                        dragActive
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
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
                                                        accept=".html,.htm"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />

                                                    {file ? (
                                                        <div className="flex items-center justify-center gap-3">
                                                            <FileText className="h-8 w-8 text-primary" />
                                                            <div className="text-left">
                                                                <p className="text-sm font-medium">{file.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {(file.size / 1024).toFixed(1)} Ko
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeFile();
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">
                                                                Glissez-déposez votre fichier ici, ou{" "}
                                                                <span className="text-primary font-medium">
                                                                    parcourez
                                                                </span>
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Fichiers HTML uniquement
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            disabled={loading || (!url && !file)}
                                        >
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

                            </TabsContent>
                        ))}
                    </Tabs>
                ) : tools.length === 1 ? (
                    <Card className="p-6 shadow-none">
                        <p className="text-sm text-muted-foreground mb-6">{tools[0].description}</p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isUrlTool(tools[0]) ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">URL à convertir</label>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fichier à convertir</label>
                                    <div
                                        className={cn(
                                            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                                            dragActive
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
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
                                            accept=".html,.htm"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="h-8 w-8 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024).toFixed(1)} Ko
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                                >
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
                                                <p className="text-xs text-muted-foreground">Fichiers HTML uniquement</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={loading || (!url && !file)}
                            >
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
                ) : null}
            </div>
        </section>
    );
}
