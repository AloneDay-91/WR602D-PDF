import React from "react";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const stats = [
    { value: "10 000+", label: "Documents convertis" },
    { value: "99.9%", label: "Disponibilité" },
    { value: "< 5s", label: "Temps moyen" },
];

const formats = ["HTML", "URL", "Word", "Excel", "PowerPoint", "Image", "PDF"];

export default function HeroSection() {
    return (
        <section className="relative py-24 px-4 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Badge */}
                <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary px-3 py-1">
                    <Zap className="h-3 w-3 fill-primary" />
                    Conversion instantanée & gratuite
                </Badge>

                {/* Headline */}
                <div className="space-y-4">
                    <h1 className="text-5xl sm:text-6xl tracking-tight leading-tight">
                        Convertissez vos fichiers en{" "}
                        <span className="text-primary relative">
                            PDF
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full" />
                        </span>
                        {" "}en un clic
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Transformez vos documents HTML, Word, Excel, images et pages web en PDF de qualité professionnelle.
                        Rapide, simple et sécurisé.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button size="lg" asChild className="shadow-md shadow-primary/20">
                        <a href="/convertisseur">
                            Convertir maintenant
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <a href="/abonnement">Voir les tarifs</a>
                    </Button>
                </div>

                {/* Format pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground mr-1">Formats supportés :</span>
                    {formats.map((f) => (
                        <span key={f} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                            {f}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>


            </div>
        </section>
    );
}
