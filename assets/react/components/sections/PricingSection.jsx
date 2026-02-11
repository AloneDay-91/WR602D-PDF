import React from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const plans = [
    {
        name: "Gratuit",
        price: "0",
        description: "Pour un usage personnel occasionnel.",
        features: [
            "5 conversions par jour",
            "Taille max : 5 Mo",
            "Formats : HTML, Image",
            "Filigrane ZenPDF",
        ],
        cta: "Commencer",
        variant: "outline",
        popular: false,
    },
    {
        name: "Pro",
        price: "9",
        description: "Pour les professionnels et les équipes.",
        features: [
            "Conversions illimitées",
            "Taille max : 50 Mo",
            "Tous les formats",
            "Sans filigrane",
            "Fusion et compression",
            "Support prioritaire",
        ],
        cta: "Essai gratuit 14 jours",
        variant: "default",
        popular: true,
    },
    {
        name: "Entreprise",
        price: "29",
        description: "Pour les grandes organisations.",
        features: [
            "Tout le plan Pro",
            "API dédiée",
            "SSO & gestion d'équipe",
            "SLA 99.9%",
            "Support dédié 24/7",
            "Facturation personnalisée",
        ],
        cta: "Nous contacter",
        variant: "outline",
        popular: false,
    },
];

export default function PricingSection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl ">Tarifs simples et transparents</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Choisissez le plan adapté à vos besoins. Changez ou annulez à tout moment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={cn(
                                "flex flex-col",
                                plan.popular && "border-primary shadow-lg scale-105"
                            )}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    {plan.popular && <Badge>Populaire</Badge>}
                                </div>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="pt-2">
                                    <span className="text-4xl font-bold">{plan.price}&euro;</span>
                                    <span className="text-muted-foreground text-sm"> /mois</span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button variant={plan.variant} className="w-full">
                                    {plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
