import React, { useState } from "react";
import { icons, FileDown, Zap, Shield, Layers } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import DropZone from "../components/DropZone";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

const ACCEPT_BY_SLUG = {
    word:       ".doc,.docx,.docm,.dot,.dotm,.dotx,.odt,.rtf,.txt",
    excel:      ".xls,.xlsx,.xlsm,.xlsb,.xlt,.xltm,.xltx,.ods,.csv",
    powerpoint: ".ppt,.pptx,.pptm,.pot,.potm,.potx,.pps,.odp",
    image:      ".jpg,.jpeg,.png,.bmp,.gif,.tif,.tiff,.psd",
};

const HINT_BY_SLUG = {
    word:       "Word (.doc, .docx, .odt, .rtf…)",
    excel:      "Excel (.xls, .xlsx, .ods, .csv…)",
    powerpoint: "Présentations (.ppt, .pptx, .odp…)",
    image:      "Images (.jpg, .png, .tiff, .bmp…)",
};

const FEATURES = [
    { icon: Layers, title: "Multi-formats", desc: "Word, Excel, PowerPoint, images et plus" },
    { icon: Zap,    title: "Rapide",        desc: "Conversion via LibreOffice en quelques secondes" },
    { icon: Shield, title: "Sécurisé",      desc: "Fichiers supprimés après traitement" },
];

export default function LibreOfficePage({ tool, allTools = [], user = null }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const accept = ACCEPT_BY_SLUG[tool.slug] ?? "*";
    const hint   = HINT_BY_SLUG[tool.slug] ?? "Fichier à convertir";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch(`/convertisseur/${tool.slug}`, { method: "POST", body: formData });
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
                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                    <Label>Fichier à convertir</Label>
                    <DropZone
                        file={file}
                        onFile={setFile}
                        onRemove={() => setFile(null)}
                        accept={accept}
                        hint={hint}
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