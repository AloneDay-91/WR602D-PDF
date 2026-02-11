import React, { useState } from "react";
import { Upload, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

export default function HeroSection() {
    const [url, setUrl] = useState("");

    return (
        <section className="py-24 px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <Badge variant="outline" className="shrink-0 rounded-full bg-background gap-2" size="sm">
                        <div className="rounded-full bg-primary h-1.5 w-1.5"></div>
                        <span>Conversion instantané gratuitement</span>
                    </Badge>
                    <h1 className="text-4xl font-thin sm:text-5xl">
                        Convertissez vos fichiers en{" "}
                        <span className="text-primary underline decoration-primary/30 underline-offset-4">PDF</span>{" "}
                        en un clic
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Transformez vos documents HTML, images et pages web en PDF de qualité professionnelle. Rapide, simple et gratuit.
                    </p>
                </div>

                <div className="border-2 border-dashed bg-background rounded-xl p-10 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-secondary p-3">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Glissez-déposez votre fichier ici</p>
                            <p className="text-sm text-muted-foreground">HTML, DOC, JPG, PNG — Max 10 Mo</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
