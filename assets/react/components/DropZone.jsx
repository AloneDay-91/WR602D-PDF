import React, { useRef, useState } from "react";
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
    // Counter avoids false leaves when cursor moves over child elements
    const [dragCount, setDragCount] = useState(0);
    const isDragging = dragCount > 0;

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCount((c) => c + 1);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCount((c) => Math.max(0, c - 1));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCount(0);
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
                isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-primary/3"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
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
                    <div className={cn(
                        "rounded-xl p-3 transition-colors",
                        isDragging ? "bg-primary/15" : "bg-muted group-hover:bg-primary/10"
                    )}>
                        <Upload className={cn(
                            "h-6 w-6 transition-colors",
                            isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {isDragging ? (
                                <span className="text-primary font-semibold">Déposez ici</span>
                            ) : (
                                <>Glissez-déposez, ou <span className="text-primary">parcourez</span></>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                    </div>
                </div>
            )}
        </div>
    );
}