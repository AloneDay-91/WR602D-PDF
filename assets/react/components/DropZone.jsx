import React, { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function DropZone({
    file,
    onFile,
    onRemove,
    accept = "*",
    hint = "Glissez-déposez votre fichier ici",
    multiple = false,
}) {
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropped = e.dataTransfer.files;
        if (dropped?.length) onFile(multiple ? dropped : dropped[0]);
    };

    const handleChange = (e) => {
        const selected = e.target.files;
        if (selected?.length) onFile(multiple ? selected : selected[0]);
    };

    return (
        <div
            className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group",
                "border-border hover:border-primary/50 hover:bg-primary/3"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                className="hidden"
            />

            {file ? (
                <div className="flex items-center justify-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} Ko</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="rounded-xl bg-muted p-3 group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Glissez-déposez, ou{" "}
                            <span className="text-primary">parcourez</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                    </div>
                </div>
            )}
        </div>
    );
}