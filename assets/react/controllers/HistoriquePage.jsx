import React from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { FileText, Clock, Inbox, Download } from "lucide-react";

const TOOL_LABELS = {
    url:        { label: "URL → PDF",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    html:       { label: "HTML → PDF",       color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
    word:       { label: "Word → PDF",       color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
    excel:      { label: "Excel → PDF",      color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    powerpoint: { label: "PowerPoint → PDF", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    image:      { label: "Image → PDF",      color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
    merge:      { label: "Fusion PDF",       color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    split:      { label: "Découpage PDF",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
    pdfa:       { label: "PDF/A",            color: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
    encrypt:    { label: "Chiffrement PDF",  color: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300" },
};

function formatDate(iso) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
        day:    "2-digit",
        month:  "short",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

export default function HistoriquePage({ generations = [], user = null, tools = [] }) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="zenpdf-theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header tools={tools} user={user} />

                <main className="flex-1 py-12 px-4">
                    <div className="max-w-3xl mx-auto space-y-8">

                        <div>
                            <h1 className="text-2xl font-semibold">Historique</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Toutes vos conversions et générations de documents.
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Générations récentes
                                </CardTitle>
                                <CardDescription>
                                    {generations.length} génération{generations.length !== 1 ? "s" : ""} au total
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {generations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                        <Inbox className="h-10 w-10 opacity-40" />
                                        <p className="text-sm">Aucune génération pour l'instant.</p>
                                        <a href="/convertisseur" className="text-sm text-primary underline-offset-4 hover:underline">
                                            Convertir un document
                                        </a>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {generations.map((gen) => {
                                            const meta = TOOL_LABELS[gen.toolSlug] ?? {
                                                label: gen.toolSlug,
                                                color: "bg-muted text-muted-foreground",
                                            };
                                            return (
                                                <li key={gen.id} className="flex items-center justify-between py-3 gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}>
                                                            {meta.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {formatDate(gen.createdAt)}
                                                        </span>
                                                        {gen.downloadUrl && (
                                                            <a
                                                                href={gen.downloadUrl}
                                                                title={gen.originalFilename ?? "Télécharger"}
                                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                                Télécharger
                                                            </a>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}