import React, { useState, useRef } from "react";
import { FileDown, Bold, Italic, Heading, List, Minus, Zap, Shield, Type } from "lucide-react";
import ToolPageLayout from "../components/ToolPageLayout";
import { fetchConvert, downloadBlob } from "../lib/fetchConvert";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

const FEATURES = [
    { icon: Type,   title: "Éditeur riche",  desc: "Formatage gras, italique, titres, listes" },
    { icon: Zap,    title: "Rapide",         desc: "Export PDF en un clic" },
    { icon: Shield, title: "Sécurisé",       desc: "Fichiers supprimés après traitement" },
];

function ToolbarBtn({ onClick, title, children, active }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            className={cn(
                "p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
                active && "bg-muted text-foreground"
            )}
        >
            {children}
        </button>
    );
}

export default function WysiwygPage({ tool, allTools = [], user = null }) {
    const editorRef             = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const exec = (cmd, value = null) => {
        document.execCommand(cmd, false, value);
        editorRef.current?.focus();
    };

    const handleInput = () => {
        const text = editorRef.current?.innerText?.trim() ?? "";
        setIsEmpty(text.length === 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const htmlContent = editorRef.current?.innerHTML ?? "";
        if (!htmlContent.trim()) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("htmlContent", htmlContent);
        try {
            const response = await fetchConvert("/convertisseur/wysiwyg", formData);
            if (!response) return; // 403 handled by ToolPageLayout dialog
            const blob = await response.blob();
            downloadBlob(blob, "document.pdf");
        } catch {
            alert("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout tool={tool} allTools={allTools} user={user} features={FEATURES}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-0.5 p-2 border-b border-border bg-muted/30 flex-wrap">
                        <ToolbarBtn onClick={() => exec("bold")} title="Gras (Ctrl+B)">
                            <Bold className="h-4 w-4" />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => exec("italic")} title="Italique (Ctrl+I)">
                            <Italic className="h-4 w-4" />
                        </ToolbarBtn>
                        <div className="w-px h-5 bg-border mx-1" />
                        <ToolbarBtn onClick={() => exec("formatBlock", "h1")} title="Titre 1">
                            <span className="text-xs font-bold">H1</span>
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => exec("formatBlock", "h2")} title="Titre 2">
                            <span className="text-xs font-bold">H2</span>
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => exec("formatBlock", "h3")} title="Titre 3">
                            <span className="text-xs font-bold">H3</span>
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => exec("formatBlock", "p")} title="Paragraphe">
                            <Type className="h-4 w-4" />
                        </ToolbarBtn>
                        <div className="w-px h-5 bg-border mx-1" />
                        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Liste à puces">
                            <List className="h-4 w-4" />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => exec("insertHorizontalRule")} title="Séparateur">
                            <Minus className="h-4 w-4" />
                        </ToolbarBtn>
                        <div className="w-px h-5 bg-border mx-1" />
                        <ToolbarBtn onClick={() => exec("removeFormat")} title="Effacer le formatage">
                            <span className="text-xs">T</span>
                        </ToolbarBtn>
                    </div>

                    {/* Editor area */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        data-placeholder="Commencez à écrire votre document ici…"
                        className="min-h-[320px] p-5 focus:outline-none text-sm leading-relaxed
                            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3
                            [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:mb-2
                            [&_h3]:text-lg  [&_h3]:font-semibold [&_h3]:mb-2
                            [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                            [&_hr]:border-t [&_hr]:border-border [&_hr]:my-4
                            empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
                        style={{ caretColor: "currentColor" }}
                    />
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/20" disabled={loading || isEmpty}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Conversion en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            Exporter en PDF
                        </span>
                    )}
                </Button>
            </form>
        </ToolPageLayout>
    );
}