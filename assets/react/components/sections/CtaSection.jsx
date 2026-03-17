import React from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "../ui/button";

export default function CtaSection() {
    return (
        <section className="py-20 px-4 border-t border-border">
            <div className="max-w-3xl mx-auto">
                <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 text-center overflow-hidden shadow-xl shadow-primary/5">
                    {/* Background blur */}
                    <div className="absolute inset-0 -z-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/8 rounded-full blur-3xl" />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 p-2 mb-6">
                        <Zap className="h-5 w-5 text-primary fill-primary" />
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                        Prêt à simplifier vos PDF ?
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                        Rejoignez des milliers d'utilisateurs qui convertissent leurs fichiers en PDF chaque jour.
                        Gratuit, sans carte requise.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button size="lg" asChild className="shadow-md shadow-primary/20">
                            <a href="/convertisseur">
                                Commencer gratuitement
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <a href="/contact">Nous contacter</a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}