import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function CtaSection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6 rounded-2xl border border-border bg-card p-12 shadow-sm">
                <h2 className="text-3xl">
                    Prêt à simplifier vos PDF ?
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Rejoignez des milliers d'utilisateurs qui convertissent leurs fichiers en PDF chaque jour. Gratuit, sans inscription.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button size="lg" asChild>
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
        </section>
    );
}