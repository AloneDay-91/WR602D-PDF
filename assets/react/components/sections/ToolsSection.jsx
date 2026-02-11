import React from "react";
import { FileText, Image, Globe, FileCode, Combine, FileDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

const tools = [
    {
        icon: Globe,
        title: "URL vers PDF",
        description: "Convertissez n'importe quelle page web en document PDF depuis son URL.",
    },
    {
        icon: FileText,
        title: "HTML vers PDF",
        description: "Transformez vos fichiers HTML en PDF avec un rendu fidèle.",
    },
    {
        icon: Image,
        title: "Image vers PDF",
        description: "Convertissez vos images JPG, PNG ou WebP en documents PDF.",
    },
    {
        icon: FileCode,
        title: "Markdown vers PDF",
        description: "Générez des PDF propres depuis vos fichiers Markdown.",
    },
    {
        icon: Combine,
        title: "Fusionner PDF",
        description: "Combinez plusieurs fichiers PDF en un seul document.",
    },
    {
        icon: FileDown,
        title: "Compresser PDF",
        description: "Réduisez la taille de vos PDF sans perdre en qualité.",
    },
];

export default function ToolsSection() {
    return (
        <section className="py-20 px-4 bg-background border-y">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl">Nos outils</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Tout ce dont vous avez besoin pour gérer vos PDF, regroupé en un seul endroit.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool) => (
                        <Card
                            key={tool.title}
                            className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30 shadow-none"
                        >
                            <CardHeader className="space-y-3">
                                <div className="rounded-lg bg-secondary p-2.5 w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <tool.icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base">{tool.title}</CardTitle>
                                <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
